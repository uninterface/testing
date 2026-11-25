import { createUiApplication } from '@uninterface/uninterface/setup'
import CollectionFixture from './CollectionFixture.vue'

export async function mountCollectionFixture() {
  const params = new URLSearchParams(location.search)
  document.documentElement.dir = params.get('dir') === 'rtl' ? 'rtl' : 'ltr'
  const app = createUiApplication(CollectionFixture, {
    colorMode: {
      document,
      preference: params.get('theme') === 'dark' ? 'dark' : 'light',
    },
  })
  await app.ui.ready
  app.mount(document.body.appendChild(document.createElement('main')))
}
