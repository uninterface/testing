import { h } from 'vue'
import {
  createUiFieldControl,
  UiApp,
  UiField,
  UiFileInput,
  type UiFileDescriptor,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mountFileInputFixture({ disabled = false } = {}) {
  const field = createUiFieldControl<UiFileDescriptor<File> | null>(null)
  const host = document.createElement('main')
  host.setAttribute('data-file-input-fixture', '')
  document.body.append(host)
  const app = createUiApplication({
    render: () =>
      h(UiApp, () =>
        h(UiField, { label: 'Attachment', field }, () =>
          h(UiFileInput, { disabled }),
        ),
      ),
  })
  await app.ui.ready
  app.mount(host)
}
