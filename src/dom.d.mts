import type {
  UiCardTestParts,
  UiFieldFeedbackTestParts,
  UiFieldGroupTestParts,
  UiTableBodyTestParts,
  UiTemporalPickerTestParts,
  UiMenuEntryIconTestParts,
} from './playwright.js'

export interface UiDomFieldTestParts {
  label: Element | null
  labelTarget: Element | null
  surface: Element
  required: {
    elements: Element[]
    before: Element | null
    after: Element | null
  }
}
export type UiDomFieldGroupTestParts = Pick<
  UiFieldGroupTestParts<Element | null>,
  'label' | 'controlArea'
>
export type UiDomFieldFeedbackTestParts =
  UiFieldFeedbackTestParts<Element | null>
export type UiDomTableBodyTestParts = UiTableBodyTestParts<Element | null>

export interface UiDomFieldSelectors {
  root: string
  surface: string
  required: string
  invalid: string
}

export function domFieldParts(
  editor: Element,
  selectors: UiDomFieldSelectors,
): UiDomFieldTestParts
export function domFieldFeedbackParts(
  editor: Element,
  selectors: UiDomFieldSelectors,
): UiDomFieldFeedbackTestParts

export type UiDomTemporalPickerTestParts =
  UiTemporalPickerTestParts<Element | null>
export type UiDomMenuEntryIconTestParts =
  UiMenuEntryIconTestParts<Element | null>

export type UiDomCardTestParts = UiCardTestParts<Element | null>

export interface UiDomSelectTestParts {
  kind: 'native' | 'composite'
  selection(): Element | null
  popup?(owned: Element): Element | null
}

export interface UiDomNavigationEntryTarget {
  name: string | RegExp
  kind: 'submenu' | 'destination'
}

export interface UiDomTestAdapter {
  version: 1
  card?(card: Element): UiDomCardTestParts
  emptyState?(scope: Element): Element | null
  tableBody?(scope: Element): UiDomTableBodyTestParts
  temporalPicker?(picker: Element): UiDomTemporalPickerTestParts
  menuEntryIcon?(entry: Element): UiDomMenuEntryIconTestParts
  fieldFeedback?(editor: Element): UiDomFieldFeedbackTestParts
  fieldGroup?(group: Element): UiDomFieldGroupTestParts
  field?(editor: Element): UiDomFieldTestParts
  navigationEntries?(
    scope: ParentNode,
    kind: UiDomNavigationEntryTarget['kind'],
  ): Iterable<HTMLElement>
  select(control: Element): UiDomSelectTestParts
}

export interface UiDomSelectTest {
  readonly control: Element
  isNative(): boolean
  popup(): Element | null
  sourceStatus(): Element
  candidates(): Element[]
  candidateKey(candidate: Element): string | undefined
  displayedLabel(): string
  open(): Promise<void>
  choose(choice: { key: string }): Promise<void>
  expectLabel(label: string): void
  expectSourceState(
    state: 'idle' | 'loading' | 'refreshing' | 'ready' | 'error',
  ): void
  expectStatus(message: string, label: string): void
  expectLoading(label?: string): void
}

export interface UiDomMenuTest {
  entry(target: { key: string }): HTMLElement | null
}

export interface UiDomTest {
  card(card: Element): UiDomCardTestParts
  emptyState(scope: Element): Element | null
  tableBody(scope: Element): UiDomTableBodyTestParts
  temporalPicker(picker: Element): UiDomTemporalPickerTestParts
  menuEntryIcon(entry: Element): UiDomMenuEntryIconTestParts
  fieldFeedback(editor: Element): UiDomFieldFeedbackTestParts
  fieldGroup(group: Element): UiDomFieldGroupTestParts
  field(editor: Element): UiDomFieldTestParts
  navigationEntry(
    scope: ParentNode,
    target: UiDomNavigationEntryTarget,
  ): HTMLElement | null
  menu(surface: Element): UiDomMenuTest
  select(control: Element): UiDomSelectTest
}

export function createUiDomTest(
  adapter: UiDomTestAdapter,
  options?: { settle?: () => void | Promise<unknown> },
): UiDomTest

export const uiNativeDomTestAdapter: UiDomTestAdapter
