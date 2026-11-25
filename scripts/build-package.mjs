import { execFileSync } from 'node:child_process'
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { posix } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { build } from 'vite'

const root = new URL('../', import.meta.url)
const source = new URL('src/', root)
const destination = new URL('dist/package/', root)
const manifest = JSON.parse(await readFile(new URL('package.json', root)))
const { scripts, devDependencies, ...distribution } = manifest
const entries = {}
const exports = {}
const nativeModules = []
for (const [name, target] of Object.entries(manifest.exports)) {
  const path = target.slice('./src/'.length)
  if (path.endsWith('.mjs')) {
    nativeModules.push(path)
    exports[name] = {
      types: `./types/${path.replace(/\.mjs$/, '.d.mts')}`,
      import: `./esm/${path}`,
    }
  } else {
    const module = path.slice(0, -'.ts'.length)
    entries[module] = fileURLToPath(new URL(path, source))
    exports[name] = {
      types: `./types/${module}.d.ts`,
      import: `./esm/${module}.js`,
    }
  }
}

await rm(destination, { force: true, recursive: true })
await build({
  root: fileURLToPath(root),
  configFile: false,
  plugins: [
    vue(),
    {
      name: 'uninterface-fixture-styles',
      generateBundle: {
        order: 'post',
        handler(_options, bundle) {
          for (const chunk of Object.values(bundle)) {
            if (chunk.type !== 'chunk') continue
            for (const asset of chunk.viteMetadata?.importedCss ?? []) {
              const relativeAsset = posix.relative(
                posix.dirname(chunk.fileName),
                asset,
              )
              const specifier = relativeAsset.startsWith('.')
                ? relativeAsset
                : `./${relativeAsset}`
              chunk.code = `import ${JSON.stringify(specifier)};\n${chunk.code}`
            }
          }
        },
      },
    },
  ],
  logLevel: 'warn',
  build: {
    outDir: fileURLToPath(new URL('esm/', destination)),
    lib: { entry: entries, formats: ['es'] },
    cssCodeSplit: true,
    minify: false,
    rollupOptions: {
      external: (id) =>
        !id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\0'),
      output: {
        preserveModules: true,
        preserveModulesRoot: fileURLToPath(source),
        entryFileNames: '[name].js',
      },
    },
  },
})

execFileSync(
  process.execPath,
  [
    fileURLToPath(import.meta.resolve('vue-tsc/bin/vue-tsc.js')),
    '-p',
    fileURLToPath(new URL('tsconfig.json', root)),
  ],
  { stdio: 'inherit' },
)

for (const path of nativeModules) {
  const output = new URL(`esm/${path}`, destination)
  await mkdir(new URL('.', output), { recursive: true })
  await cp(new URL(path, source), output)
  const declaration = new URL(path.replace(/\.mjs$/, '.d.mts'), source)
  const original = await readFile(declaration).catch((error) => {
    if (error.code !== 'ENOENT') throw error
  })
  if (original) {
    await writeFile(
      new URL(`types/${path.replace(/\.mjs$/, '.d.mts')}`, destination),
      original,
    )
  }
}
for (const path of ['README.md', 'LICENSE', 'docs']) {
  await cp(new URL(path, root), new URL(path, destination), { recursive: true })
}
distribution.files = ['esm/', 'types/', 'docs/']
distribution.exports = exports
distribution.sideEffects = ['**/*.css']
await writeFile(
  new URL('package.json', destination),
  `${JSON.stringify(distribution, null, 2)}\n`,
)
