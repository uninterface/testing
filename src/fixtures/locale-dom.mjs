import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { withBuiltDomFixture } from '../jsdom.mjs'

async function serverMessages(build, entry) {
  const directory = await mkdtemp(join(tmpdir(), 'uninterface-native-locale-'))
  try {
    await build({
      logLevel: 'silent',
      ssr: { noExternal: true },
      define: { 'process.env.NODE_ENV': '"production"', 'process.env': '{}' },
      build: {
        ssr: fileURLToPath(entry),
        outDir: directory,
        rollupOptions: { output: { entryFileNames: 'locale.mjs' } },
      },
    })
    const { renderLocale } = await import(
      pathToFileURL(join(directory, 'locale.mjs')).href
    )
    return await Promise.all(['en', 'zh-Hans'].map(renderLocale))
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

/** Verify the supplier's translator and locale aliases in two mounted apps. */
export async function verifyNativeLocale(build, entry, traditionalLocale) {
  const [englishHtml, simplifiedHtml] = await serverMessages(build, entry)
  await withBuiltDomFixture(build, entry, async ({ mountLocale }, window) => {
    assert.notEqual(englishHtml, simplifiedHtml)
    const host = window.document.body.appendChild(
      window.document.createElement('div'),
    )
    host.innerHTML = englishHtml
    const serverMessage = host.querySelector('output')
    const english = await mountLocale('en', host)
    try {
      assert.equal(host.querySelector('output'), serverMessage)
      assert.equal(host.innerHTML, englishHtml)
      const simplified = await mountLocale('zh-Hans')
      try {
        const original = english.message()
        const simplifiedMessage = simplified.message()
        assert.match(original, /[a-z]/i)
        assert.match(simplifiedMessage, /[\u3400-\u9fff]/)
        assert.notEqual(simplifiedMessage, original)

        await english.setLocale('zh_Hant')
        const traditional = english.message()
        assert.match(traditional, /[\u3400-\u9fff]/)
        assert.equal(english.state().resolved.backend, traditionalLocale)

        await english.setLocale('ar')
        assert.equal(english.state().resolved.backend, 'ar')
        assert.equal(english.state().direction, 'rtl')
        assert.match(english.message(), /[\u0600-\u06ff]/)
        assert.equal(simplified.state().locale, 'zh-Hans')
        assert.equal(simplified.state().direction, 'ltr')
        assert.equal(simplified.message(), simplifiedMessage)

        await english.setLocale('en')
        assert.equal(english.message(), original)
      } finally {
        simplified.dispose()
      }
    } finally {
      english.dispose()
    }
  })
}
