<script setup lang="ts">
  import { ref, watch, watchEffect, onScopeDispose, type Component } from 'vue'
  import {
    UiApp,
    UiCollapsible,
    UiModal,
    createUiModalControl,
    UiContent,
    UiField,
    UiForm,
    UiTextInput,
    UiSelect,
    UiCheckbox,
    UiButton,
    UiLayout,
    UiMenu,
    UiNavMenu,
    createUiFieldControl,
    createUiFormControl,
    createUiEntryControl,
    getUiRuntime,
  } from '@uninterface/uninterface'
  defineProps<{ native: Component }>()

  const expanded = ref(false)
  const modal = createUiModalControl<boolean>()
  const invalid = ref(false)
  const loading = ref(false)
  const disabled = ref(false)
  const name = createUiFieldControl('Ada')
  const location = createUiFieldControl('shanghai')
  const active = createUiFieldControl(true)
  const form = createUiFormControl({ name, location, active })
  const sourceState = ref('ready')
  const choices = createUiEntryControl(async ({ signal }) => {
    if (sourceState.value === 'loading')
      await new Promise<void>((_, reject) => {
        signal.addEventListener('abort', () => reject(new Error('Cancelled')), {
          once: true,
        })
      })
    if (sourceState.value === 'error') throw new Error('Source failed')
    return sourceState.value === 'empty'
      ? []
      : [{ key: 'shanghai', label: 'Shanghai' }]
  })
  watch(
    sourceState,
    (state) => {
      choices.clear()
      if (state !== 'idle') void choices.load()
    },
    { immediate: true },
  )
  const destination = ref('editor')
  const navigation = createUiEntryControl([
    { key: 'editor', label: 'Editor', href: '#editor' },
    {
      kind: 'submenu',
      key: 'examples',
      label: 'Examples',
      children: [
        { key: 'buttons', label: 'Buttons', href: '#buttons' },
        {
          kind: 'submenu',
          key: 'more',
          label: 'More',
          children: [{ key: 'forms', label: 'Forms', href: '#forms' }],
        },
      ],
    },
  ])
  const commands = createUiEntryControl([
    { key: 'refresh', label: 'Refresh' },
    { key: 'delete', label: 'Delete', disabled: true },
  ])
  watchEffect(() => {
    name.state.issue = invalid.value ? 'Enter a name.' : null
    name.state.disabled = disabled.value
  })
  onScopeDispose(() => {
    void modal.dispose()
    choices.dispose()
    commands.dispose()
    navigation.dispose()
    form.dispose()
  })
</script>
<template>
  <UiApp>
    <UiContent>
      <UiButton @click="modal.run()">Open adapter modal</UiButton>
      <UiModal
        :control="modal"
        title="Modal presentation"
      >
        <p>Review the operation before continuing.</p>
        <template #actions="{ session }">
          <UiButton
            data-modal-action="first"
            @click="session.complete(true)"
          >
            OK
          </UiButton>
          <UiButton
            data-modal-action="second"
            @click="session.cancel()"
          >
            Cancel
          </UiButton>
        </template>
      </UiModal>
      <h1>{{ getUiRuntime().backend.name }} presentation comparison</h1>
      <p>
        Compare toolkit defaults with the adapter. Differences in layout and
        semantic behavior need a documented reason; pixel identity is not
        required.
      </p>
      <label>
        <input
          v-model="invalid"
          type="checkbox"
        />
        Invalid
      </label>
      <label>
        <input
          v-model="loading"
          type="checkbox"
        />
        Loading
      </label>
      <label>
        <input
          v-model="disabled"
          type="checkbox"
        />
        Disabled
      </label>
      <label>
        Source state
        <select v-model="sourceState">
          <option value="idle">Not loaded</option>
          <option value="loading">Loading</option>
          <option value="error">Failed</option>
          <option value="empty">Empty</option>
          <option value="ready">Ready</option>
        </select>
      </label>
      <div class="comparison">
        <section aria-label="Native reference">
          <h2>Toolkit reference</h2>
          <component
            :is="native"
            :invalid="invalid"
            :loading="loading"
            :disabled="disabled"
            :source-state="sourceState"
          />
        </section>
        <section aria-label="Uninterface adapter">
          <h2>Uninterface adapter</h2>
          <UiCollapsible
            v-model="expanded"
            label="Additional information"
            :disabled="disabled"
            data-adapter-collapsible
          >
            <p>Retained detail content.</p>
          </UiCollapsible>
          <UiNavMenu
            :control="navigation"
            :model-value="destination"
            aria-label="Reference destinations"
          />
          <UiForm
            :control="form"
            label="Reference editor"
            :save="async () => {}"
          >
            <UiField
              :field="name"
              label="Name"
              help="Use a recognizable name."
              required
            >
              <UiTextInput />
            </UiField>
            <UiField
              :field="location"
              label="Location"
            >
              <UiSelect
                :control="choices"
                :auto-load="false"
              />
            </UiField>
            <UiField
              :field="active"
              label="Active"
            >
              <UiCheckbox />
            </UiField>
            <UiLayout
              direction="horizontal"
              wrap
            >
              <UiButton
                color="primary"
                :loading="loading"
                :disabled="disabled"
              >
                Save
              </UiButton>
              <UiButton :disabled="disabled">Reset</UiButton>
              <UiButton
                color="primary"
                variant="outline"
              >
                Outline
              </UiButton>
            </UiLayout>
            <UiMenu
              :control="commands"
              aria-label="Commands"
              mode="popup"
            >
              <template #host="{ buttonTrigger }">
                <UiButton v-bind="buttonTrigger">Commands</UiButton>
              </template>
            </UiMenu>
          </UiForm>
        </section>
      </div>
    </UiContent>
  </UiApp>
</template>
<style scoped>
  /* Test-harness comparison layout; not application presentation. */
  .comparison {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2rem;
  }
  @media (max-width: 600px) {
    .comparison {
      grid-template-columns: 1fr;
    }
  }
</style>
