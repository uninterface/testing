import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { build, mergeConfig } from 'vite'
import { createUiIconLoader } from '@uninterface/uninterface/vite'

const backendAlias = '@uninterface/backend'

export function fixtureBuildConfig({ resolveBackend, backendVite }) {
  return {
    configFile: false,
    plugins: [
      createUiIconLoader(),
      {
        name: 'uninterface-fixture-backend',
        enforce: 'pre',
        resolveId(id) {
          if (id !== backendAlias && !id.startsWith(backendAlias + '/')) return
          const target = resolveBackend(id.slice(backendAlias.length + 1))
          return target.startsWith('file:') ? fileURLToPath(target) : target
        },
      },
      vue(),
      backendVite?.(),
    ],
    resolve: { dedupe: ['vue', '@uninterface/uninterface'] },
  }
}

export function buildFixture(options, backend) {
  return build(mergeConfig(fixtureBuildConfig(backend), options))
}

/** Serve a package-owned fixture through Playwright's route interception. */
export function createBrowserFixture(build, entry) {
  const origin = 'http://uninterface-fixture.test'
  let assets

  async function buildAssets() {
    const result = await build({
      logLevel: 'silent',
      define: { 'process.env.NODE_ENV': '"production"', 'process.env': '{}' },
      build: {
        write: false,
        lib: {
          entry: fileURLToPath(entry),
          formats: ['iife'],
          name: 'Fixture',
        },
      },
    })
    const output = (Array.isArray(result) ? result : [result]).flatMap(
      ({ output }) => output,
    )
    const script = output.find((item) => item.type === 'chunk' && item.isEntry)
    if (!script) throw new Error(`Missing browser fixture bundle for ${entry}`)
    return {
      script: script.code,
      styles: output
        .filter(
          (item) => item.type === 'asset' && item.fileName.endsWith('.css'),
        )
        .map((item) => String(item.source))
        .join('\n'),
    }
  }

  return async (page, params) => {
    const { script, styles } = await (assets ??= buildAssets())
    await page.route(`${origin}/**`, (route) => {
      switch (new URL(route.request().url()).pathname) {
        case '/fixture.js':
          return route.fulfill({
            contentType: 'application/javascript',
            body: script,
          })
        case '/fixture.css':
          return route.fulfill({ contentType: 'text/css', body: styles })
        case '/':
          return route.fulfill({
            contentType: 'text/html',
            body: '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Test fixture</title><link rel="stylesheet" href="/fixture.css"></head><body><script src="/fixture.js"></script></body></html>',
          })
        default:
          return route.fulfill({ status: 404 })
      }
    })
    const url = new URL(origin)
    url.search = new URLSearchParams(params).toString()
    await page.goto(url.href)
    if ((await page.evaluate(() => document.compatMode)) !== 'CSS1Compat')
      throw new Error(`Browser fixture requires standards mode: ${entry}`)
  }
}
