import { defineComponent, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createUiApplication } from '@uninterface/uninterface/setup'

/** Call the toolkit's locale hook inside each independent application. */
export function createLocaleFixture(useNativeMessage: () => () => string) {
  const Root = defineComponent({
    setup() {
      const message = useNativeMessage()
      return () => h('output', message())
    },
  })

  function createApp(locale: string, ssr: boolean) {
    return createUiApplication(Root, {
      ssr,
      idPrefix: ssr ? 'native-locale' : undefined,
      i18n: { locale },
    })
  }

  async function mountLocale(locale: string, serverHost?: HTMLElement) {
    const app = createApp(locale, serverHost !== undefined)
    const host = serverHost ?? document.createElement('div')
    try {
      await app.ui.ready
      if (!serverHost) document.body.append(host)
      app.mount(host)
    } catch (error) {
      app.ui.dispose()
      host.remove()
      throw error
    }
    return {
      message: () => host.querySelector('output')!.textContent,
      state: () => app.ui.i18n.state.value,
      async setLocale(locale: string) {
        await app.ui.i18n.setLocale(locale)
        await nextTick()
      },
      dispose() {
        app.unmount()
        host.remove()
      },
    }
  }

  async function renderLocale(locale: string) {
    if (!import.meta.env.SSR)
      throw new Error(
        'Native locale rendering requires a server fixture build.',
      )
    const app = createApp(locale, true)
    try {
      await app.ui.ready
      return await renderToString(app)
    } finally {
      app.ui.dispose()
    }
  }

  return { mountLocale, renderLocale }
}
