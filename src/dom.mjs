import assert from 'node:assert/strict'

const textOf = (element) => element.textContent.trim()
const isDisabled = (element) =>
  element.matches(':disabled, [aria-disabled="true"]')

function isHidden(entry) {
  if (entry.closest('[hidden], [aria-hidden="true"], [inert]')) return true
  const window = entry.ownerDocument.defaultView
  if (!window) return false
  const { visibility } = window.getComputedStyle(entry)
  if (visibility === 'hidden' || visibility === 'collapse') return true
  for (let node = entry; node; node = node.parentElement)
    if (window.getComputedStyle(node).display === 'none') return true
  return false
}

export const uiNativeDomTestAdapter = {
  version: 1,
  navigationEntries(scope, kind) {
    return scope.querySelectorAll(
      kind === 'submenu'
        ? 'button[data-entry-key][aria-expanded]'
        : 'a[data-entry-key][href]',
    )
  },
  select(control) {
    return {
      kind: 'native',
      selection: () => control.selectedOptions[0] ?? null,
    }
  },
}

export function domFieldParts(editor, { root, surface, required }) {
  const field = editor.closest(root)
  const label =
    editor.labels?.[0] ??
    editor.ownerDocument.getElementById(editor.id + '-label')
  const controlSurface = editor.closest(surface) ?? editor
  return {
    label,
    labelTarget: label,
    surface: controlSurface,
    required: {
      elements: [...(field?.querySelectorAll(required) ?? [])],
      before: label,
      after: label,
    },
  }
}

export function domFieldFeedbackParts(editor, { root, invalid }) {
  const document = editor.ownerDocument
  assert.ok(editor.id, 'Field feedback inspection requires an editor ID.')
  const issue = editor.id + '-issue'
  const tooltip = [
    ...document.querySelectorAll('[data-ui-field-tooltip-for]'),
  ].find((entry) => entry.getAttribute('data-ui-field-tooltip-for') === issue)
  return {
    message: document.getElementById(issue),
    tooltip: tooltip ?? null,
    invalidSurface:
      editor.closest(invalid) ??
      editor.closest(root)?.querySelector(invalid) ??
      null,
  }
}

export function createUiDomTest(adapter, { settle = async () => {} } = {}) {
  if (adapter.version !== 1)
    throw new Error('Unsupported Uninterface DOM testing adapter version.')

  return {
    field(target) {
      if (!adapter.field)
        throw new Error('This backend does not supply field mappings.')
      return adapter.field(target)
    },
    fieldGroup(target) {
      if (!adapter.fieldGroup)
        throw new Error('This backend does not supply field group mappings.')
      return adapter.fieldGroup(target)
    },
    fieldFeedback(target) {
      if (!adapter.fieldFeedback)
        throw new Error('This backend does not supply field feedback mappings.')
      return adapter.fieldFeedback(target)
    },
    tableBody(target) {
      if (!adapter.tableBody)
        throw new Error('This backend does not supply table body mappings.')
      return adapter.tableBody(target)
    },
    emptyState(target) {
      if (!adapter.emptyState)
        throw new Error('This backend does not supply empty state mappings.')
      return adapter.emptyState(target)
    },
    temporalPicker(picker) {
      if (!adapter.temporalPicker)
        throw new Error(
          'This backend does not supply temporal picker mappings.',
        )
      return adapter.temporalPicker(picker)
    },
    menuEntryIcon(entry) {
      if (!adapter.menuEntryIcon)
        throw new Error(
          'This backend does not supply menu entry icon mappings.',
        )
      return adapter.menuEntryIcon(entry)
    },
    card(card) {
      if (!adapter.card)
        throw new Error('This backend does not supply card region mappings.')
      return adapter.card(card)
    },
    navigationEntry(scope, { name, kind }) {
      const candidates =
        adapter.navigationEntries?.(scope, kind) ??
        uiNativeDomTestAdapter.navigationEntries(scope, kind)
      const matches = [...candidates].filter((entry) => {
        const label = entry
          .getAttribute('aria-label')
          ?.replace(/\s+/g, ' ')
          .trim()
        return (
          scope !== entry &&
          scope.contains(entry) &&
          label !== undefined &&
          (typeof name === 'string'
            ? label === name
            : label.search(name) !== -1) &&
          !isHidden(entry)
        )
      })
      assert.ok(
        matches.length <= 1,
        `UiNavMenu ${kind} named ${String(name)} is ambiguous`,
      )
      return matches[0] ?? null
    },
    menu(surface) {
      assert.ok(surface?.matches('[role="menu"]'), 'UiMenu has a menu surface')
      return {
        entry({ key }) {
          const matches = [
            ...surface.querySelectorAll('[data-entry-key]'),
          ].filter(
            (entry) =>
              entry.getAttribute('data-entry-key') === key &&
              entry.matches(
                '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]',
              ) &&
              entry.closest('[role="menu"]') === surface &&
              !isHidden(entry),
          )
          assert.ok(
            matches.length <= 1,
            `UiMenu entry key ${JSON.stringify(key)} is ambiguous`,
          )
          return matches[0] ?? null
        },
      }
    },
    select(control) {
      const parts = adapter.select(control)
      const native = control.tagName === 'SELECT'
      if ((parts.kind === 'native') !== native)
        throw new Error(
          'UiSelect DOM mapping does not match the rendered control.',
        )
      const { ownerDocument } = control
      const window = ownerDocument.defaultView

      function popup() {
        if (native) return control
        const id = control.getAttribute('aria-controls')?.trim()
        if (!id) return null
        assert.doesNotMatch(id, /\s/, 'select owns one popup')
        const owned = ownerDocument.getElementById(id)
        if (!owned) return null
        const surface = parts.popup ? parts.popup(owned) : owned
        if (surface)
          assert.ok(
            surface.contains(owned) || owned.contains(surface),
            'popup mapping stays within the owned surface',
          )
        return surface
      }

      function sourceStatus() {
        assert.ok(control.id, 'select has a semantic control ID')
        const status = ownerDocument.getElementById(
          `${control.id}-source-status`,
        )
        assert.ok(status, 'select has a source status announcement')
        assert.equal(status.getAttribute('role'), 'status')
        return status
      }

      function renderedOptions() {
        if (native)
          return [...control.querySelectorAll('option')].filter(
            (option) => !option.closest('[hidden]'),
          )
        if (control.getAttribute('aria-expanded') !== 'true') return []
        const surface = popup()
        assert.ok(surface, 'opened select has an owned popup')
        return [...surface.querySelectorAll('[role="option"]')].filter(
          (option) => {
            for (let node = option; node; node = node.parentElement) {
              if (
                node.matches('[hidden], [aria-hidden="true"]') ||
                node.style.display === 'none'
              )
                return false
              if (node === surface) break
            }
            return true
          },
        )
      }

      function candidateKey(option) {
        if (native)
          return option.hasAttribute('data-uninterface-select-status')
            ? undefined
            : option.value
        return (
          option.hasAttribute('data-uninterface-key')
            ? option
            : option.querySelector('[data-uninterface-key]')
        )?.getAttribute('data-uninterface-key')
      }

      function candidates() {
        return renderedOptions().filter(
          (option) => candidateKey(option) !== undefined,
        )
      }

      function displayedLabel() {
        const selection = parts.selection()
        assert.ok(selection, 'select renders its selection or placeholder')
        return textOf(selection)
      }

      function expectLabel(label) {
        assert.equal(displayedLabel(), label)
      }

      async function open() {
        if (native) return
        assert.ok(!isDisabled(control), 'select is available')
        if (control.getAttribute('aria-expanded') !== 'true') {
          control.dispatchEvent(
            new window.KeyboardEvent('keydown', {
              key: 'ArrowDown',
              bubbles: true,
            }),
          )
          await settle()
        }
        assert.equal(
          control.getAttribute('aria-expanded'),
          'true',
          'picker opens',
        )
        assert.ok(popup(), 'opened select has an owned popup')
      }

      async function choose({ key }) {
        assert.ok(!isDisabled(control), 'select is available')
        await open()
        const matches = candidates().filter(
          (option) => candidateKey(option) === key,
        )
        assert.equal(
          matches.length,
          1,
          `select exposes one candidate for ${JSON.stringify(key)}`,
        )
        const [option] = matches
        assert.ok(!isDisabled(option), 'candidate is available')
        if (native) {
          assert.ok(!control.multiple, 'choose requires a single select')
          control.value = key
          control.dispatchEvent(new window.Event('change', { bubbles: true }))
        } else {
          for (const event of ['pointerdown', 'pointerup']) {
            option.dispatchEvent(
              new window.PointerEvent(event, {
                bubbles: true,
                pointerId: 1,
                pointerType: 'mouse',
                isPrimary: true,
              }),
            )
          }
          option.click()
        }
        await settle()
      }

      function expectSourceState(state) {
        assert.equal(
          sourceStatus().getAttribute('data-uninterface-source-state'),
          state,
        )
        if (state === 'loading' || state === 'refreshing')
          assert.equal(control.getAttribute('aria-busy'), 'true')
      }

      function expectStatus(message, label) {
        assert.ok(
          !isDisabled(control),
          'source feedback leaves the picker available',
        )
        if (label !== undefined) expectLabel(label)
        const announcement = sourceStatus()
        assert.equal(textOf(announcement), message)
        assert.ok(
          control
            .getAttribute('aria-describedby')
            ?.split(/\s+/)
            .includes(announcement.id),
          'the picker references its source announcement',
        )
        if (!native && control.getAttribute('aria-expanded') !== 'true') return

        const surface = popup()
        assert.ok(surface, 'source feedback belongs to the opened picker')
        const options = renderedOptions()
        for (const option of options) {
          assert.equal(
            candidateKey(option),
            undefined,
            'a status row has no business key',
          )
          assert.ok(isDisabled(option), 'a status row cannot be selected')
        }
        if (native) {
          assert.deepEqual(options.map(textOf), [message])
          assert.ok(
            control.selectedOptions[0]?.hidden,
            'retained option stays out of the choices',
          )
          assert.ok(
            control.selectedOptions[0]?.disabled,
            'retained option is unavailable',
          )
        } else {
          assert.ok(
            textOf(surface).includes(message),
            'source feedback is present inside the picker',
          )
        }
      }

      return {
        control,
        isNative: () => native,
        popup,
        sourceStatus,
        candidates,
        candidateKey,
        displayedLabel,
        open,
        choose,
        expectLabel,
        expectSourceState,
        expectStatus,
        expectLoading(label) {
          const status = sourceStatus()
          assert.match(
            status.getAttribute('data-uninterface-source-state') ?? '',
            /^(loading|refreshing)$/,
          )
          assert.equal(control.getAttribute('aria-busy'), 'true')
          const message = textOf(status)
          assert.ok(message, 'loading is announced')
          expectStatus(message, label)
        },
      }
    },
  }
}
