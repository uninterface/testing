import type { InlineConfig, PluginOption } from 'vite'
import type { Page } from '@playwright/test'

export interface FixtureBackend {
  /** Resolve the package root for an empty subpath, or a package export. */
  resolveBackend(subpath: string): string
  backendVite?: () => PluginOption
}

export function fixtureBuildConfig(backend: FixtureBackend): InlineConfig
export function buildFixture(
  options: InlineConfig,
  backend: FixtureBackend,
): ReturnType<typeof import('vite').build>

export function createBrowserFixture(
  build: (options: InlineConfig) => ReturnType<typeof import('vite').build>,
  entry: URL,
): (page: Page, params?: Record<string, string>) => Promise<void>
