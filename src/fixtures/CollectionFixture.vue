<script setup lang="ts">
  import { computed, onUnmounted, ref } from 'vue'
  import {
    collectionFilterBadges,
    collectionSortBadges,
    createUiCollectionSortBinding,
    createUiListControl,
    createUiListFilterSource,
    createUiRangeFilterControl,
    UiButton,
    UiCollectionField,
    UiCollectionFilter,
    UiCollectionHeader,
    UiCollectionView,
    UiContent,
    UiLayout,
    useUiResponsive,
    type UiButtonBinding,
  } from '@uninterface/uninterface'

  const orders = [
    { id: 'A-01', customer: 'Cedar Supply', amount: 75 },
    { id: 'A-02', customer: 'Harbor Tools', amount: 125 },
    { id: 'A-03', customer: 'Maple Workshop', amount: 200 },
    { id: 'A-04', customer: 'Spruce Studio', amount: 300 },
  ]
  type Order = (typeof orders)[number]
  type SortKey = keyof Order
  type Filters = { minimum?: number; maximum?: number }
  const labels = { id: 'Order', customer: 'Customer', amount: 'Amount (USD)' }
  const control = createUiListControl<Order, Filters, SortKey>({
    itemKey: (order) => order.id,
    query: { filters: {}, sort: [] },
    sorting: { mode: 'multiple', keys: ['id', 'customer', 'amount'] },
    source({ filters, sort }) {
      const { minimum = 0, maximum = Infinity } = filters
      const items = orders
        .filter(({ amount }) => amount >= minimum && amount <= maximum)
        .sort((left, right) => {
          for (const { key, direction } of sort) {
            const a = left[key]
            const b = right[key]
            const order = a < b ? -1 : a > b ? 1 : 0
            if (order) return direction === 'asc' ? order : -order
          }
          return 0
        })
      return { items, complete: true }
    },
  })
  const sorting = createUiCollectionSortBinding(control.bindings.list, labels)
  const range = createUiRangeFilterControl<Filters, number>(
    {
      key: 'amount',
      fieldKeys: ['amount'],
      label: () => 'Amount range (USD)',
      read: ({ minimum, maximum }) => ({ minimum, maximum }),
      write: (_filters, value) => value,
      equals: (a, b) => a.minimum === b.minimum && a.maximum === b.maximum,
      isActive: ({ minimum, maximum }) =>
        minimum !== undefined || maximum !== undefined,
      clear: () => ({}),
      summarize: ({ minimum, maximum }) => ({
        text: `${minimum ?? '…'} – ${maximum ?? '…'}`,
      }),
      editing: { commit: 'explicit' },
      codec: {
        parse(input) {
          return /^\d+(\.\d{1,2})?$/.test(input) &&
            Number.isFinite(Number(input))
            ? { ok: true, value: Number(input) }
            : { ok: false, issue: 'Enter a nonnegative amount.' }
        },
        format: (value) => value.toFixed(2),
      },
      compare: (a, b) => a - b,
      invalidRange: 'Minimum amount must not exceed maximum amount.',
      minimumLabel: 'Minimum amount (USD)',
      maximumLabel: 'Maximum amount (USD)',
      applyLabel: 'Apply amount range',
      clearLabel: 'Clear amount range',
      inputmode: 'decimal',
    },
    createUiListFilterSource(control.bindings.list),
  )
  const reset: UiButtonBinding = {
    target: 'button',
    type: 'button',
    loading: false,
    get disabled() {
      return (
        !range.binding.active &&
        !range.binding.dirty &&
        !control.state.query.sort.length
      )
    },
    activate() {
      range.binding.discard()
      void control.setQuery({ filters: {}, sort: [] })
    },
  }

  const cards = ref(false)
  const { context } = useUiResponsive()
  const badges = computed(() => cards.value && context.value !== 'mobile')
  onUnmounted(() => {
    range.dispose()
    control.dispose()
  })
  void control.refresh()
</script>

<template>
  <!-- Leave ordinary content insets around markers painted outside the badges. -->
  <UiContent>
    <UiLayout direction="vertical">
      <UiButton
        v-if="!cards"
        @click="cards = true"
      >
        Show cards
      </UiButton>
      <UiCollectionHeader
        :active-filter-count="range.binding.active ? 1 : 0"
        :filter-bindings="cards ? [range.binding] : undefined"
        :filter-panel="badges ? collectionFilterBadges : undefined"
        :sort-binding="cards ? sorting : undefined"
        :sort-panel="badges ? collectionSortBadges : undefined"
        :reset="reset"
      />
      <UiCollectionView
        :binding="control.bindings.list"
        :presentation="cards ? 'cards-full-width' : 'table'"
        aria-label="Orders"
        scroll="horizontal"
      >
        <!-- @vue-generic {Order, Filters, SortKey} -->
        <UiCollectionField
          field-key="id"
          :label="labels.id"
          role="title"
          preferred-width="9rem"
          min-width="7rem"
          :spring="false"
          sort-by="id"
        >
          <template #default="{ item }">{{ item.id }}</template>
        </UiCollectionField>
        <!-- @vue-generic {Order, Filters, SortKey} -->
        <UiCollectionField
          field-key="customer"
          :label="labels.customer"
          preferred-width="20rem"
          min-width="8rem"
          sort-by="customer"
          resizable
        >
          <template #default="{ item }">{{ item.customer }}</template>
        </UiCollectionField>
        <!-- @vue-generic {Order, Filters, SortKey} -->
        <UiCollectionField
          field-key="amount"
          :label="labels.amount"
          preferred-width="content"
          min-width="content"
          :spring="false"
          align="right"
          sort-by="amount"
          filter-by="minimum"
          :filter-active="range.binding.active"
        >
          <template #default="{ item }">{{ item.amount.toFixed(2) }}</template>
          <template #filter="{ close }">
            <UiCollectionFilter
              :binding="range.binding"
              @applied="close"
            />
          </template>
        </UiCollectionField>
        <!-- @vue-generic {Order, Filters, SortKey} -->
        <UiCollectionField
          field-key="status"
          label="Status"
        >
          <template #default>Open</template>
        </UiCollectionField>
      </UiCollectionView>
    </UiLayout>
  </UiContent>
</template>
