import {
  expect,
  type Locator,
  type Page,
  type PlaywrightWorkerOptions,
} from '@playwright/test'
import type { FocusPaint } from './browser-presentation.js'

export { clickUiFieldLabel } from './field-label.js'
export {
  expectContainedFocusPaint,
  readContainedFocusPaint,
  waitForPresentation,
  type FocusPaint,
} from './browser-presentation.js'

/** Rendered targets for disclosure, temporal mode and file name checks. */
export interface BrowserControlParts {
  collapsibleTrigger(scope: Page | Locator, name: string | RegExp): Locator
  temporalMode(
    trigger: Locator,
    value: 'start' | 'bounded',
    label: string,
  ): { kind: 'native'; control: Locator } | { kind: 'menu'; option: Locator }
  fileInputName(
    root: Locator,
  ): { kind: 'native'; control: Locator } | { kind: 'text'; control: Locator }
  fileInput(
    root: Locator,
    clearName: string,
  ): {
    chooser: Locator
    frame: Locator
    focusedFrame: Locator
    clear: Locator
    clearFocus: FocusPaint
  }
}

/** One component instance's actual rendered parts; mappings never perform actions. */
export interface UiSelectTestParts {
  kind: 'native' | 'composite'
  trigger: Locator
  selection: Locator
  popup(): Promise<Locator>
}

/** Multiple-selection mapping adds the native or integrated clear action to native/composite parts. */
export interface UiMultiSelectTestParts extends UiSelectTestParts {
  clear: Locator
}

/** Actual presentation parts of one field editor; resolve again after strategy changes. */
export interface UiFieldTestParts {
  label: Locator
  /** Pointer receiver at the visible label's position; may contain the input. */
  labelTarget: Locator
  surface: Locator
  required: {
    elements: Locator
    before: Locator
    after: Locator
  }
}

export interface UiCardTestParts<Part = Locator> {
  header: Part
  body: Part
  footer: Part
  topEnd: Part
}

export interface UiFieldGroupTestParts<Part = Locator> {
  label: Part
  controlArea: Part
  required: { elements: Part; before: Part; after: Part }
}

export interface UiCheckableTestParts {
  text: Locator
  surface: Locator
}

export interface UiInputFrameTestParts {
  surface: Locator
}

export interface UiFieldFeedbackTestParts<Part = Locator> {
  message: Part
  tooltip: Part
  invalidSurface: Part
}

export interface UiTableBodyTestParts<Part = Locator> {
  body: Part
  scrollSurface: Part
  emptyState: Part
  errorState: Part
}

export interface UiFeedbackItemTestParts<Part = Locator> {
  content: Part
  surface: Part
}

export interface UiProgressBarTestParts<Part = Locator> {
  track: Part
  fill: Part
}

export interface UiUploadRegionTestParts {
  surface: Locator
  chooser: Locator
  chooserFocus: FocusPaint
}

export interface UiTemporalPickerTestParts<Part = Locator> {
  dateInput: Part
  timeInput: Part
  day(isoDate: string): Part
  timeSegment(unit: 'hour' | 'minute' | 'second'): Part
}

export interface UiMenuEntryIconTestParts<Part = Locator> {
  icon: Part
  column: Part
}

/** Rendered regions of one UiModal. */
export interface UiModalTestParts {
  body: Locator
  /** The region hosting either footer slot. Matches nothing when omitted. */
  actions: Locator
}

/** Rendered caption and optional sorting parts of one column header. */
export interface UiColumnHeaderTestParts {
  caption: Locator
  sortTarget: Locator
  sortIndicator: Locator
}

type StepSkipReason = (
  step: string,
  context: {
    browserName: PlaywrightWorkerOptions['browserName']
    viewportWidth: number
  },
) => string | undefined

/** Backend-owned browser test mappings and optional step exceptions. */
export interface UiTestAdapter {
  version: 1
  /** Reason for an accepted exception to a named, opt-in test step. */
  stepSkipReason?: StepSkipReason
  select(control: Locator): UiSelectTestParts
  multiSelect?(control: Locator): Promise<UiMultiSelectTestParts>
  checkbox(control: Locator): Locator
  choice?(
    group: Locator,
    key: string,
    kind: 'radio' | 'checkbox',
  ): { control: Locator; target: Locator }
  field?(control: Locator): Promise<UiFieldTestParts>
  fieldGroup?(group: Locator): UiFieldGroupTestParts
  fieldFeedback?(editor: Locator): Promise<UiFieldFeedbackTestParts>
  checkable?(control: Locator): Promise<UiCheckableTestParts>
  inputFrame?(frame: Locator): UiInputFrameTestParts
  buttonFocus?(button: Locator): FocusPaint | Promise<FocusPaint>
  card?(card: Locator): UiCardTestParts
  tableBody?(table: Locator): UiTableBodyTestParts
  feedbackItem?(item: Locator): UiFeedbackItemTestParts
  progressBar?(bar: Locator): UiProgressBarTestParts
  uploadRegion?(
    region: Locator,
  ): UiUploadRegionTestParts | Promise<UiUploadRegionTestParts>
  temporalPicker?(picker: Locator): UiTemporalPickerTestParts
  menuEntryIcon?(entry: Locator): UiMenuEntryIconTestParts
  modal?(dialog: Locator): UiModalTestParts
  popoverSurface?(dialog: Locator): Locator
  menuPopup?(menu: Locator): Locator
  navigationEntry?(
    scope: Page | Locator,
    target: { name: string | RegExp; kind: 'submenu' | 'destination' },
  ): Locator
  columnHeaders?(table: Locator): Locator
  columnHeaderParts?(header: Locator): UiColumnHeaderTestParts
  tableHeaderSeparator?(table: Locator): {
    elements: Locator
    paint: 'box' | 'bottom-border'
  }
}

/** Discover by accessible name, application test ID, or an existing semantic locator. */
export type UiTestTarget =
  | Locator
  | { name: string | RegExp }
  | { testId: string }

export type UiSelectSourceState =
  | 'idle'
  | 'loading'
  | 'refreshing'
  | 'ready'
  | 'error'

/** Native controls need no toolkit-specific mapping. */
export const uiNativeTestAdapter: UiTestAdapter = {
  version: 1,
  tableHeaderSeparator(table) {
    return {
      elements: table.locator(':scope > thead > tr:last-child > th'),
      paint: 'bottom-border',
    }
  },
  select(control) {
    return {
      kind: 'native',
      trigger: control,
      selection: control.locator('option:checked'),
      popup: async () => control,
    }
  },
  async multiSelect(control) {
    const id = await control.getAttribute('id')
    return {
      ...uiNativeTestAdapter.select(control),
      clear: control.page().locator(attribute('id', `${id}-clear`)),
    }
  },
  checkbox: (control) => control,
  choice(group, key, kind) {
    const marker = group.locator(attribute('data-uninterface-key', key))
    const control = group.getByRole(kind).and(marker.or(marker.getByRole(kind)))
    // Segmented native radios can be visually hidden inside their hit label.
    const target = control.locator(
      'xpath=ancestor::label[1] | self::*[not(ancestor::label)]',
    )
    return { control, target }
  },
  navigationEntry(scope, { name, kind }) {
    return scope
      .getByRole(kind === 'submenu' ? 'button' : 'link', { name, exact: true })
      .and(
        scope.locator(
          kind === 'submenu'
            ? '[data-entry-key][aria-expanded]'
            : '[data-entry-key]',
        ),
      )
  },
  async field(control) {
    const id = await control.getAttribute('id')
    if (!id)
      throw new Error('Field inspection requires its semantic editor ID.')
    const label = control.page().locator(`label${attribute('for', id)}`)
    const frame = control.locator('xpath=ancestor::*[@data-ui-input-frame][1]')
    return {
      label,
      labelTarget: label,
      surface: (await frame.count()) ? frame : control,
      required: {
        elements: label.locator(':scope > :not(*)'),
        before: label,
        after: label,
      },
    }
  },
  async checkable(control) {
    const id = await control.getAttribute('id')
    const wrapped = control.locator('xpath=ancestor::label[1]')
    if (!id) return { text: wrapped, surface: control }
    const labels = control.page().locator(`label${attribute('for', id)}`)
    const text = labels.filter({ hasText: /\S/ })
    return {
      text: (await text.count()) ? text : wrapped,
      surface: control,
    }
  },
}

// Escape arbitrary business keys and generated IDs as CSS string contents.
function attribute(name: string, value: string) {
  const escaped = Array.from(
    value,
    (char) => `\\${char.codePointAt(0)!.toString(16)} `,
  ).join('')
  return `[${name}="${escaped}"]`
}

export async function browserFieldFeedbackParts(
  editor: Locator,
  invalidSelector: string,
): Promise<UiFieldFeedbackTestParts> {
  const id = await editor.getAttribute('id')
  if (!id) throw new Error('Field feedback inspection requires an editor ID.')
  const issue = id + '-issue'
  const page = editor.page()
  return {
    message: page.locator(attribute('id', issue)),
    tooltip: page.locator(attribute('data-ui-field-tooltip-for', issue)),
    invalidSurface: editor
      .locator('xpath=ancestor-or-self::*')
      .and(page.locator(invalidSelector))
      .last(),
  }
}

export interface UiSelectTest {
  readonly control: Locator
  isNative(): Promise<boolean>
  /** Native OS popup inspection is unavailable; this fails for native selects. */
  open(): Promise<void>
  /** The rendered surface of an open composite picker. */
  popupSurface(): Promise<Locator>
  /** Rendered candidates, including disabled status options where used. */
  candidates(): Promise<Locator>
  choose(choice: { key: string }): Promise<void>
  expectLabel(label: string): Promise<void>
  expectSourceState(state: UiSelectSourceState): Promise<void>
  expectLoading(label?: string): Promise<void>
  expectStatus(
    message: string,
    label: string,
    inspectPopup?: boolean,
  ): Promise<void>
  expectPlaceholderHidden(label: string): Promise<void>
}

export interface UiMultiSelectTest {
  readonly control: Locator
  open(): Promise<void>
  close(): Promise<void>
  candidates(): Promise<Locator>
  setSelected(key: string, selected: boolean): Promise<void>
  expectSelected(key: string, selected?: boolean): Promise<void>
  clear(): Promise<void>
}

export interface UiCheckboxTest {
  readonly control: Locator
  setChecked(checked: boolean): Promise<void>
}

export interface UiChoiceGroupTest {
  readonly control: Locator
  option(key: string): Locator
  choose(key: string): Promise<void>
  setChecked(key: string, checked: boolean): Promise<void>
}

export interface UiMenuTest {
  entry(target: { key: string }): Locator
  popup(): Promise<Locator>
}

export interface UiPopoverTest {
  surface(): Promise<Locator>
}

export interface UiTableTest {
  headerSeparator(): Promise<{
    x: number
    y: number
    width: number
    height: number
  }>
}

export interface UiColumnHeaderTest {
  parts(): Promise<UiColumnHeaderTestParts>
}

export interface UiTest {
  stepSkipReason: StepSkipReason
  within(scope: Locator): UiTest
  navigationEntry(target: {
    name: string | RegExp
    kind: 'submenu' | 'destination'
  }): Locator
  columnHeaders(table: Locator): Locator
  columnHeader(header: Locator): UiColumnHeaderTest
  table(table: Locator): UiTableTest
  field(control: Locator): Promise<UiFieldTestParts>
  fieldGroup(group: Locator): UiFieldGroupTestParts
  fieldFeedback(editor: Locator): Promise<UiFieldFeedbackTestParts>
  checkable(control: Locator): Promise<UiCheckableTestParts>
  inputFrame(frame: Locator): UiInputFrameTestParts
  buttonFocus(button: Locator): Promise<FocusPaint>
  card(card: Locator): UiCardTestParts
  tableBody(table: Locator): UiTableBodyTestParts
  feedbackItem(item: Locator): UiFeedbackItemTestParts
  progressBar(bar: Locator): UiProgressBarTestParts
  uploadRegion(region: Locator): Promise<UiUploadRegionTestParts>
  temporalPicker(picker: Locator): UiTemporalPickerTestParts
  menuEntryIcon(entry: Locator): UiMenuEntryIconTestParts
  modal(dialog: Locator): Promise<UiModalTestParts>
  popover(dialog: Locator): UiPopoverTest
  menu(surface: Locator): UiMenuTest
  select(target: UiTestTarget): UiSelectTest
  multiSelect(target: UiTestTarget): UiMultiSelectTest
  checkbox(target: UiTestTarget): UiCheckboxTest
  radioGroup(target: UiTestTarget): UiChoiceGroupTest
  checkboxGroup(target: UiTestTarget): UiChoiceGroupTest
}

/** Configure once in a test fixture; share the resulting factory with business tests. */
export function createUiTest(page: Page, adapter: UiTestAdapter): UiTest {
  if (adapter.version !== 1)
    throw new Error('Unsupported Uninterface testing adapter version.')
  function scoped(scope: Page | Locator): UiTest {
    function find(target: UiTestTarget, role: 'combobox' | 'checkbox') {
      if ('name' in target)
        return scope.getByRole(role, { name: target.name, exact: true })
      if ('testId' in target) return scope.getByTestId(target.testId)
      return target
    }
    function choiceGroup(
      target: UiTestTarget,
      kind: 'radio' | 'checkbox',
    ): UiChoiceGroupTest {
      const group =
        'name' in target
          ? scope.locator('[data-uninterface-choice-group]').and(
              scope
                .getByRole(kind === 'radio' ? 'radiogroup' : 'group', {
                  name: target.name,
                  exact: true,
                })
                .or(
                  scope.getByRole('group', {
                    name: target.name,
                    exact: true,
                  }),
                ),
            )
          : 'testId' in target
            ? scope.getByTestId(target.testId)
            : target
      function parts(key: string) {
        if (!adapter.choice)
          throw new Error('This backend does not supply choice group mappings.')
        return adapter.choice(group, key, kind)
      }
      return {
        control: group,
        option: (key) => parts(key).control,
        async choose(key) {
          if (kind !== 'radio')
            throw new Error('Use setChecked for checkbox membership.')
          const part = parts(key)
          await expect(part.control).toHaveCount(1)
          await expect(part.control).toBeEnabled()
          await part.target.click()
          await expect(part.control).toBeChecked()
        },
        async setChecked(key, checked) {
          if (kind !== 'checkbox')
            throw new Error('Use choose for a radio group.')
          const part = parts(key)
          await expect(part.control).toHaveCount(1)
          await expect(part.control).toBeEnabled()
          if ((await part.control.isChecked()) !== checked)
            await part.target.click()
          await expect(part.control).toBeChecked({ checked })
        },
      }
    }
    return {
      stepSkipReason: (step, context) =>
        adapter.stepSkipReason?.(step, context),
      radioGroup: (target) => choiceGroup(target, 'radio'),
      checkboxGroup: (target) => choiceGroup(target, 'checkbox'),
      within: (scope) => scoped(scope),
      navigationEntry(target) {
        if (!adapter.navigationEntry)
          throw new Error(
            'This backend does not supply navigation entry mappings.',
          )
        return adapter.navigationEntry(scope, target)
      },
      columnHeaders(table) {
        return adapter.columnHeaders?.(table) ?? table.getByRole('columnheader')
      },
      columnHeader(header) {
        return {
          async parts() {
            if (!adapter.columnHeaderParts)
              throw new Error(
                'This backend does not supply column header parts.',
              )
            await expect(header).toHaveCount(1)
            const parts = adapter.columnHeaderParts(header)
            await expect(parts.caption).toHaveCount(1)
            await expect
              .poll(() => parts.sortTarget.count())
              .toBeLessThanOrEqual(1)
            await expect
              .poll(() => parts.sortIndicator.count())
              .toBeLessThanOrEqual(1)
            return parts
          },
        }
      },
      table(table) {
        return {
          async headerSeparator() {
            if (!adapter.tableHeaderSeparator)
              throw new Error(
                'This backend does not supply a table header separator mapping.',
              )
            await expect(table).toHaveCount(1)
            await expect(table).toBeVisible()
            const { elements, paint } = adapter.tableHeaderSeparator(table)
            const boxes = await elements.evaluateAll(
              (nodes, paint) =>
                nodes.flatMap((node) => {
                  const { left, right, top, bottom, height, width } =
                    node.getBoundingClientRect()
                  if (width <= 0 || height <= 0) return []
                  if (paint === 'box') return [{ left, right, top, bottom }]
                  const style = getComputedStyle(node)
                  const border = parseFloat(style.borderBottomWidth)
                  if (
                    border <= 0 ||
                    style.borderBottomStyle === 'none' ||
                    style.borderBottomStyle === 'hidden' ||
                    style.borderBottomColor === 'rgba(0, 0, 0, 0)'
                  )
                    return []
                  const edge =
                    style.borderCollapse === 'collapse'
                      ? bottom + border / 2
                      : bottom
                  return [{ left, right, top: edge - border, bottom: edge }]
                }),
              paint,
            )
            expect(
              boxes.length,
              'The table has a rendered header separator',
            ).toBeGreaterThan(0)
            const x = Math.min(...boxes.map((box) => box.left))
            const y = Math.min(...boxes.map((box) => box.top))
            return {
              x,
              y,
              width: Math.max(...boxes.map((box) => box.right)) - x,
              height: Math.max(...boxes.map((box) => box.bottom)) - y,
            }
          },
        }
      },
      menu(surface) {
        return {
          async popup() {
            if (!adapter.menuPopup)
              throw new Error(
                'This backend does not supply menu popup mappings.',
              )
            await expect(surface).toHaveCount(1)
            const popup = adapter.menuPopup(surface)
            await expect(
              popup,
              'The menu has one floating surface',
            ).toHaveCount(1)
            return popup
          },
          entry({ key }) {
            const roles = surface
              .getByRole('menuitem')
              .or(surface.getByRole('menuitemcheckbox'))
              .or(surface.getByRole('menuitemradio'))
            const marker = attribute('data-entry-key', key)
            return roles.and(
              surface.locator(
                `${marker}:not(:scope [role="menu"] *, [inert], [inert] *)`,
              ),
            )
          },
        }
      },
      async field(control) {
        if (!adapter.field)
          throw new Error(
            'This backend does not supply field inspection mappings.',
          )
        const parts = await adapter.field(control)
        await expect(parts.label).toHaveCount(1)
        await expect(parts.labelTarget).toHaveCount(1)
        await expect(parts.surface).toHaveCount(1)
        return parts
      },
      fieldGroup(target) {
        if (!adapter.fieldGroup)
          throw new Error('This backend does not supply field group mappings.')
        return adapter.fieldGroup(target)
      },
      fieldFeedback(target) {
        if (!adapter.fieldFeedback)
          throw new Error(
            'This backend does not supply field feedback mappings.',
          )
        return adapter.fieldFeedback(target)
      },
      async checkable(control) {
        if (!adapter.checkable)
          throw new Error('This backend does not supply checkable mappings.')
        const parts = await adapter.checkable(control)
        await expect(parts.text).toHaveCount(1)
        await expect(parts.surface).toHaveCount(1)
        return parts
      },
      inputFrame(frame) {
        if (!adapter.inputFrame)
          throw new Error('This backend does not supply input frame mappings.')
        return adapter.inputFrame(frame)
      },
      async buttonFocus(button) {
        if (!adapter.buttonFocus)
          throw new Error('This backend does not supply button focus mappings.')
        return adapter.buttonFocus(button)
      },
      card(target) {
        if (!adapter.card)
          throw new Error('This backend does not supply card region mappings.')
        return adapter.card(target)
      },
      tableBody(target) {
        if (!adapter.tableBody)
          throw new Error('This backend does not supply table body mappings.')
        return adapter.tableBody(target)
      },
      feedbackItem(target) {
        if (!adapter.feedbackItem)
          throw new Error(
            'This backend does not supply feedback item mappings.',
          )
        return adapter.feedbackItem(target)
      },
      progressBar(target) {
        if (!adapter.progressBar)
          throw new Error('This backend does not supply progress bar mappings.')
        return adapter.progressBar(target)
      },
      async uploadRegion(target) {
        if (!adapter.uploadRegion)
          throw new Error(
            'This backend does not supply upload region mappings.',
          )
        return adapter.uploadRegion(target)
      },
      temporalPicker(target) {
        if (!adapter.temporalPicker)
          throw new Error(
            'This backend does not supply temporal picker mappings.',
          )
        return adapter.temporalPicker(target)
      },
      menuEntryIcon(target) {
        if (!adapter.menuEntryIcon)
          throw new Error(
            'This backend does not supply menu entry icon mappings.',
          )
        return adapter.menuEntryIcon(target)
      },
      async modal(dialog) {
        if (!adapter.modal)
          throw new Error('This backend does not supply modal region mappings.')
        await expect(dialog).toHaveCount(1)
        const parts = adapter.modal(dialog)
        await expect(parts.body).toHaveCount(1)
        await expect.poll(() => parts.actions.count()).toBeLessThanOrEqual(1)
        return parts
      },
      popover(dialog) {
        return {
          async surface() {
            if (!adapter.popoverSurface)
              throw new Error(
                'This backend does not supply a popover surface mapping.',
              )
            await expect(dialog).toHaveCount(1)
            await expect(dialog).toBeVisible()
            const panel = adapter.popoverSurface(dialog)
            await expect(
              panel,
              'The popover has one panel surface',
            ).toHaveCount(1)
            await expect(panel).toBeVisible()
            return panel
          },
        }
      },
      checkbox(target) {
        const control = find(target, 'checkbox')
        return {
          control,
          async setChecked(checked) {
            await expect(control).toBeEnabled()
            if ((await control.getAttribute('aria-checked')) === 'mixed')
              await adapter.checkbox(control).click()
            if ((await control.isChecked()) !== checked)
              await adapter.checkbox(control).click()
            await expect(control).toBeChecked({ checked })
          },
        }
      },
      multiSelect(target) {
        let control =
          'name' in target
            ? scope
                .getByRole('combobox', { name: target.name, exact: true })
                .or(
                  scope.getByRole('listbox', {
                    name: target.name,
                    exact: true,
                  }),
                )
            : 'testId' in target
              ? scope.getByTestId(target.testId)
              : target
        let mapped: UiMultiSelectTestParts | undefined
        async function parts() {
          if (mapped) return mapped
          if (!adapter.multiSelect)
            throw new Error(
              'This backend does not supply multiple-select mappings.',
            )
          const id = await control.getAttribute('id')
          if (!id)
            throw new Error(
              'UiMultiSelect testing requires its semantic editor ID.',
            )
          control = page.locator(attribute('id', id))
          mapped = await adapter.multiSelect(control)
          return mapped
        }
        async function open() {
          const view = await parts()
          await expect(control).toBeEnabled()
          if (view.kind === 'native') return
          if ((await control.getAttribute('aria-expanded')) !== 'true')
            await view.trigger.click()
          await expect(await view.popup()).toBeVisible()
        }
        async function close() {
          const view = await parts()
          if (view.kind === 'native') return
          if ((await control.getAttribute('aria-expanded')) === 'true') {
            await page.keyboard.press('Escape')
            await expect(control).toHaveAttribute('aria-expanded', 'false')
          }
        }
        async function candidates() {
          await open()
          const view = await parts()
          return view.kind === 'native'
            ? control.locator('option')
            : (await view.popup()).getByRole('option')
        }
        async function option(key: string) {
          const view = await parts()
          if (view.kind === 'native')
            return control.locator(`option${attribute('value', key)}`)
          const marker = attribute('data-uninterface-key', key)
          return (await candidates()).and(
            page.locator(`${marker}, [role=option]:has(${marker})`),
          )
        }
        async function selected(key: string) {
          const view = await parts()
          const choice = await option(key)
          if ((await choice.count()) === 0) return false
          return view.kind === 'native'
            ? choice.evaluate((node) => (node as HTMLOptionElement).selected)
            : (await choice.getAttribute('aria-selected')) === 'true'
        }
        return {
          get control() {
            return control
          },
          open,
          close,
          candidates,
          async setSelected(key, value) {
            const view = await parts()
            await expect(control).toBeEnabled()
            const choice = await option(key)
            await expect(choice).toHaveCount(1)
            await expect(choice).toBeEnabled()
            if ((await selected(key)) !== value) {
              if (view.kind === 'native') {
                const values = await control.evaluate((node) =>
                  Array.from((node as HTMLSelectElement).selectedOptions)
                    // Playwright refuses selectOption when any requested option
                    // is disabled. Only request editable membership; the control
                    // contract preserves currently locked selections on change.
                    .filter((option) => !option.matches(':disabled'))
                    .map((option) => option.value),
                )
                await control.selectOption(
                  value
                    ? [...values, key]
                    : values.filter((current) => current !== key),
                )
              } else await choice.click()
            }
            await expect.poll(() => selected(key)).toBe(value)
            await close()
          },
          async expectSelected(key, value = true) {
            await expect.poll(() => selected(key)).toBe(value)
            await close()
          },
          async clear() {
            await close()
            const view = await parts()
            // Native clear affordances may appear only on focus/hover.
            await control.focus()
            await view.trigger.hover()
            await expect(view.clear).toBeEnabled()
            await view.clear.click()
          },
        }
      },
      select(target) {
        let control = find(target, 'combobox')
        let parts: UiSelectTestParts | undefined
        async function resolve() {
          if (parts) return parts
          // Keep identity while modal pickers hide surrounding accessibility nodes.
          const id = await control.getAttribute('id')
          if (!id)
            throw new Error(
              'UiSelect testing requires an ID on its semantic control.',
            )
          control = page.locator(attribute('id', id))
          parts = adapter.select(control)
          const native = await control.evaluate(
            (node) => node instanceof HTMLSelectElement,
          )
          if (native !== (parts.kind === 'native'))
            throw new Error(
              'UiSelect testing mapping does not match its rendered interaction model.',
            )
          return parts
        }
        async function status() {
          await resolve()
          return page.locator(
            attribute(
              'id',
              `${await control.getAttribute('id')}-source-status`,
            ),
          )
        }
        async function openComposite() {
          const view = await resolve()
          if (view.kind === 'native')
            throw new Error(
              'Native select popup inspection is unsupported. Use choose(), candidates(), or native keyboard tests.',
            )
          await expect(control).toBeEnabled()
          if ((await control.getAttribute('aria-expanded')) !== 'true')
            await view.trigger.click()
          await expect(control).toHaveAttribute('aria-expanded', 'true')
          await expect(await view.popup()).toBeVisible()
        }
        async function popupSurface() {
          const view = await resolve()
          if (view.kind === 'native')
            throw new Error('Native select popup inspection is unsupported.')
          await expect(control).toHaveAttribute('aria-expanded', 'true')
          const popup = await view.popup()
          await expect(
            popup,
            'The select has one open popup surface',
          ).toHaveCount(1)
          await expect(popup).toBeVisible()
          return popup
        }
        async function candidates() {
          const view = await resolve()
          if (view.kind === 'native')
            return control.locator('option:not([hidden])')
          await openComposite()
          return (await view.popup()).getByRole('option')
        }
        async function expectLabel(label: string) {
          const view = await resolve()
          await expect(view.selection).toHaveText(label)
        }
        async function inspectStatus() {
          const view = await resolve()
          const options = await candidates()
          // A status may be a disabled option or a native no-data/loading area.
          await expect(
            options.and(
              page.locator(
                '[data-uninterface-key], [role=option]:has([data-uninterface-key])',
              ),
            ),
          ).toHaveCount(0)
          const count = await options.count()
          for (let index = 0; index < count; index++)
            await expect(options.nth(index)).toBeDisabled()
          const announcement = await status()
          await expect(announcement).not.toHaveText('')
          const message = (await announcement.innerText()).trim()
          if (view.kind === 'native') {
            await expect(options).toHaveText([message])
            await expect(control.locator('option:checked')).toHaveAttribute(
              'hidden',
              '',
            )
            await expect(control.locator('option:checked')).toBeDisabled()
          } else {
            await expect(await view.popup()).toContainText(message)
          }
        }
        return {
          get control() {
            return control
          },
          async isNative() {
            return (await resolve()).kind === 'native'
          },
          open: openComposite,
          popupSurface,
          candidates,
          expectLabel,
          async choose({ key }) {
            const view = await resolve()
            await expect(control).toBeEnabled()
            if (view.kind === 'native') {
              const option = control.locator(`option${attribute('value', key)}`)
              await expect(option).not.toHaveAttribute('hidden', '')
              await expect(option).toBeEnabled()
              const label = (await option.textContent())!.trim()
              await control.selectOption(key)
              await expect(control).toHaveValue(key)
              await expectLabel(label)
            } else {
              const options = await candidates()
              const marker = attribute('data-uninterface-key', key)
              const option = options.and(
                page.locator(`${marker}, [role="option"]:has(${marker})`),
              )
              await expect(
                option,
                `UiSelect candidate key ${JSON.stringify(key)} must identify one rendered option`,
              ).toHaveCount(1)
              await expect(option).toBeEnabled()
              const label = (await option.innerText()).trim()
              await option.click()
              await expect(control).toHaveAttribute('aria-expanded', 'false')
              await expectLabel(label)
            }
          },
          async expectSourceState(state) {
            await expect(await status()).toHaveAttribute(
              'data-uninterface-source-state',
              state,
            )
            if (state === 'loading' || state === 'refreshing')
              await expect(control).toHaveAttribute('aria-busy', 'true')
          },
          async expectLoading(label) {
            await expect(await status()).toHaveAttribute(
              'data-uninterface-source-state',
              /^(loading|refreshing)$/,
            )
            await expect(control).toHaveAttribute('aria-busy', 'true')
            if (label !== undefined) await expectLabel(label)
            await inspectStatus()
          },
          async expectStatus(message, label, inspectPopup = true) {
            await resolve()
            await expect(control).toBeEnabled()
            await expectLabel(label)
            const announcement = await status()
            await expect(announcement).toHaveText(message)
            const id = await announcement.getAttribute('id')
            await expect
              .poll(async () =>
                (await control.getAttribute('aria-describedby'))?.split(/\s+/),
              )
              .toContain(id)
            if ((await resolve()).kind === 'native' || inspectPopup)
              await inspectStatus()
          },
          async expectPlaceholderHidden(label) {
            if ((await resolve()).kind === 'native')
              await expect(control.locator('option[value=""]')).toHaveAttribute(
                'hidden',
                '',
              )
            else
              await expect(
                (await candidates()).and(
                  page.getByRole('option', { name: label, exact: true }),
                ),
              ).toHaveCount(0)
          },
        }
      },
    }
  }
  return scoped(page)
}
