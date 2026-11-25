import { h, type Component } from 'vue'
import { createUiApplication } from '@uninterface/uninterface/setup'
import ReferenceComparison from './ReferenceComparison.vue'

/** Show a backend-supplied upstream reference alongside the shared composition. */
export async function mountReferenceFixture(native: Component) {
  const app = createUiApplication(
    { render: () => h(ReferenceComparison, { native }) },
    { document },
  )
  await app.ui.ready
  document.body.classList.add('uninterface-body-margin0')
  app.mount(document.body.appendChild(document.createElement('div')))
}
