import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import {
  copyFileSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const source = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const distribution = join(root, 'dist/package')
const manifest = JSON.parse(
  readFileSync(join(distribution, 'package.json'), 'utf8'),
)
const directory = mkdtempSync(join(tmpdir(), 'uninterface-testing-'))
const npmEnvironment = { ...process.env }
// npm test exports this setting, but npm install rejects it for project installs.
delete npmEnvironment.npm_config_allow_scripts
const npm = (args, cwd) =>
  execFileSync(process.execPath, [process.env.npm_execpath, ...args], {
    cwd,
    env: npmEnvironment,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  })

try {
  const [pack] = JSON.parse(
    npm(
      [
        'pack',
        './dist/package',
        '--offline',
        '--ignore-scripts',
        '--json',
        '--pack-destination',
        directory,
      ],
      root,
    ),
  )
  const files = new Set(pack.files.map(({ path }) => path))
  assert.equal(pack.name, source.name)
  assert.equal(pack.version, source.version)
  assert.equal(manifest.private, undefined)
  assert.equal(manifest.dependencies, undefined)
  assert.deepEqual(Object.keys(manifest.exports), Object.keys(source.exports))
  for (const { types, import: runtime } of Object.values(manifest.exports)) {
    assert.match(runtime, /^\.\/esm\/.+\.m?js$/)
    assert.match(types, /^\.\/types\/.+\.d\.(ts|mts)$/)
    for (const target of [types, runtime]) {
      assert.ok(files.has(target.slice(2)), `Missing package export ${target}`)
    }
  }
  for (const file of [
    'LICENSE',
    'README.md',
    'docs/setup.md',
    'docs/package-release.md',
  ]) {
    assert.ok(files.has(file), `Missing package file ${file}`)
  }
  for (const file of files) assert.doesNotMatch(file, /^(src|node_modules)\//)

  const tests = new URL('../tests/package-consumer/', import.meta.url)
  for (const file of ['check.mjs', 'types.ts']) {
    copyFileSync(new URL(file, tests), join(directory, file))
  }
  writeFileSync(
    join(directory, 'package.json'),
    JSON.stringify({
      name: 'uninterface-testing-consumer',
      private: true,
      type: 'module',
      dependencies: {
        '@uninterface/uninterface':
          source.devDependencies['@uninterface/uninterface'],
        vue: source.devDependencies.vue,
      },
      devDependencies: {
        [manifest.name]: `file:./${pack.filename}`,
        '@playwright/test': source.devDependencies['@playwright/test'],
        '@types/node': source.devDependencies['@types/node'],
        '@vitejs/plugin-vue': source.devDependencies['@vitejs/plugin-vue'],
        jsdom: source.devDependencies.jsdom,
        typescript: source.devDependencies.typescript,
        vite: source.devDependencies.vite,
      },
    }),
  )
  npm(
    [
      'install',
      '--strict-peer-deps',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
    ],
    directory,
  )
  execFileSync(process.execPath, ['check.mjs'], {
    cwd: directory,
    stdio: 'inherit',
  })
  execFileSync(
    process.execPath,
    [
      'node_modules/typescript/bin/tsc',
      '--noEmit',
      '--strict',
      '--skipLibCheck',
      '--target',
      'ES2022',
      '--module',
      'NodeNext',
      'types.ts',
    ],
    { cwd: directory, stdio: 'inherit' },
  )

  if (process.env.UNINTERFACE_PACK_FILE) {
    copyFileSync(
      join(directory, pack.filename),
      process.env.UNINTERFACE_PACK_FILE,
    )
  }
  console.log(
    `${pack.name}@${pack.version}: verified ${files.size} packed files`,
  )
} finally {
  rmSync(directory, { recursive: true, force: true })
}
