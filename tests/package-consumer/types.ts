import type { Page } from '@playwright/test'
import {
  createUiTest,
  uiNativeTestAdapter,
  type UiTest,
} from '@uninterface/testing/playwright'
import { createUiDomTest } from '@uninterface/testing/dom'
import { buildFixture } from '@uninterface/testing/fixture-build'
import { mountCollectionFixture } from '@uninterface/testing/fixtures/collection'

declare const page: Page
const ui: UiTest = createUiTest(page, uiNativeTestAdapter)
void ui.select({ name: 'Category' }).choose({ key: 'services' })
void createUiDomTest
void buildFixture
void mountCollectionFixture
