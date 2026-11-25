import { JSDOM } from 'jsdom'
import FileList from 'jsdom/lib/jsdom/living/generated/FileList.js'
import idlUtils from 'jsdom/lib/jsdom/living/generated/utils.js'
import { fileURLToPath } from 'node:url'

/** Evaluate a package-owned fixture with the caller's backend build. */
export async function withBuiltDomFixture(build, entry, inspect) {
  const result = await build({
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"', 'process.env': '{}' },
    build: {
      write: false,
      lib: { entry: fileURLToPath(entry), formats: ['iife'], name: 'Fixture' },
    },
  })
  const script = (Array.isArray(result) ? result : [result])
    .flatMap(({ output }) => output)
    .find((item) => item.type === 'chunk' && item.isEntry)
  if (!script) throw new Error(`Missing DOM fixture bundle for ${entry}`)

  const { window } = new JSDOM('<!doctype html><body></body>', {
    url: 'http://localhost/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  })
  try {
    installDomEnvironment(window)
    window.eval(script.code)
    return await inspect(window.Fixture, window)
  } finally {
    window.close()
  }
}

/** Model Chromium's blur when a focused button becomes disabled. JSDOM keeps
 * that button active, which otherwise hides pending-action recovery failures.
 * Opt in for focus lifecycle tests; this does not establish browser acceptance.
 */
export function installDisabledButtonBlur(window) {
  const prototype = window.HTMLButtonElement.prototype
  const disabled = Object.getOwnPropertyDescriptor(prototype, 'disabled')
  const blur = (button) => {
    if (window.document.activeElement === button) button.blur()
  }
  Object.defineProperty(prototype, 'disabled', {
    ...disabled,
    set(value) {
      // Blur first: JSDOM refuses blur() once the control is disabled.
      if (value) blur(this)
      disabled.set.call(this, value)
    },
  })
  const setAttribute = prototype.setAttribute
  prototype.setAttribute = function (name, value) {
    if (name.toLowerCase() === 'disabled') blur(this)
    return setAttribute.call(this, name, value)
  }
}

/** Browser API shims for state/DOM tests; these do not verify layout geometry. */
export function installDomEnvironment(window) {
  // jsdom has FileList/input.files but no DataTransfer constructor. Produce real
  // jsdom FileLists so native assignments, clearing and fakepath values stay tested.
  window.DataTransfer ??= class {
    #files = []
    items = {
      add: (file) => {
        this.#files.push(file)
      },
    }
    get files() {
      const list = FileList.createImpl(window)
      for (const file of this.#files) list.push(idlUtils.implForWrapper(file))
      return idlUtils.wrapperForImpl(list)
    }
  }
  window.structuredClone ??= structuredClone
  window.matchMedia ??= (media) => ({
    media,
    matches: false,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return true
    },
  })
  window.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.IntersectionObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.requestAnimationFrame ??= (callback) =>
    window.setTimeout(() => callback(0), 0)
  window.cancelAnimationFrame ??= (id) => window.clearTimeout(id)
  if (!window.visualViewport) {
    const viewport = new window.EventTarget()
    Object.defineProperties(viewport, {
      width: { get: () => window.innerWidth },
      height: { get: () => window.innerHeight },
      offsetLeft: { value: 0 },
      offsetTop: { value: 0 },
      pageLeft: { get: () => window.scrollX },
      pageTop: { get: () => window.scrollY },
      scale: { value: 1 },
    })
    window.visualViewport = viewport
  }
  window.PointerEvent ??= window.MouseEvent
  window.HTMLElement.prototype.scrollIntoView ??= function () {}
  // Top-layer geometry is browser-tested; DOM tests only exercise popup lifecycle.
  window.HTMLElement.prototype.showPopover ??= function () {}
  window.HTMLElement.prototype.hidePopover ??= function () {}
  // jsdom exposes an unimplemented stub; document scrolling is browser-tested.
  window.scrollTo = function () {}
  window.HTMLElement.prototype.hasPointerCapture ??= function () {
    return false
  }
  window.HTMLElement.prototype.setPointerCapture ??= function () {}
  window.HTMLElement.prototype.releasePointerCapture ??= function () {}
  window.CSS ??= {
    supports: () => false,
    escape: (value) =>
      String(value).replace(/[^a-zA-Z0-9_-]/g, (char) => `\\${char}`),
  }
}

/** Provide visibility and a conservative hit-test fallback for simulated menus. */
export function installMenuDomEnvironment(window) {
  installDomEnvironment(window)
  // jsdom cannot find scroll ancestors by hit testing. Use the document host.
  const { document } = window
  document.elementsFromPoint ??= () => [document.body]
  // Menu focus filtering uses offsetParent as a visibility signal. Model that
  // signal for connected and unhidden elements without simulating positions.
  Object.defineProperty(window.HTMLElement.prototype, 'offsetParent', {
    configurable: true,
    get() {
      return this.isConnected &&
        !this.closest('[hidden], [inert], [style*="display: none"]')
        ? this.parentElement
        : null
    },
  })
}

/** Read the shared checkbox state from native or ARIA checkbox semantics. */
export function isChecked(control) {
  return control.matches('input[type="checkbox"]')
    ? control.checked
    : control.getAttribute('aria-checked') === 'true'
}
