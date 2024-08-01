<script lang="ts" setup>
definePageMeta({
  layout: 'panel',
})

const api = useAPI()
const page = ref(1)
const search = ref()
const stateFilter = ref(0)
const typeFilter = ref(9)
const fromFilter = ref('')
const toFilter = ref('')

const {
  data: tranferes,
  status,
  refresh,
} = await useLazyAsyncData<{ rows: IOrder[]; count: number }>(
  'tranferes',
  () =>
    $fetch(`${api.url}/orders/filter`, {
      query: {
        pg: page.value,
        lmt: 15,
        q: search.value,
        type: typeFilter.value,
        state: stateFilter.value,
        from: fromFilter.value,
        to: toFilter.value,
      },
    }),
  {
    default: () => ({ rows: [], count: 0 }),
    watch: [page, search, stateFilter, typeFilter, fromFilter, toFilter],
  }
)

const tableHeaders = [
  { key: 'id', label: '# رقم مرجعي' },
  { key: 'type', label: 'نوع' },
  { key: 'state', label: 'حالة' },
  { key: 'dates', label: 'تواريخ' },
  { key: 'location', label: 'مخزن' },
  { key: 'employees', label: 'موظف' },
  { key: 'actions', label: '' },
]

function dateFormat(value: string) {
  if (value) {
    return new Date(value).toLocaleString('ar-eg', {
      dateStyle: 'short',
      timeStyle: 'short',
      hour12: false,
      numberingSystem: 'latn',
    })
  } else {
    return ''
  }
}

const typeOptions = [
  { id: 9, label: 'الكل' },
  { id: 5, label: 'إدخال' },
  { id: 6, label: 'إخراج' },
]

const stateOptions = [
  { id: 0, label: 'الكل' },
  { id: 1, label: 'مسودة' },
  { id: 2, label: 'اوردر' },
  { id: 3, label: 'قيد التنفيذ' },
  { id: 4, label: 'تم التنفيذ' },
  { id: 5, label: 'ملغي' },
  { id: 6, label: 'مرفوض' },
]
</script>

<template>
  <div v-if="tranferes.rows" class="flex flex-col flex-nowrap h-full gap-y-4">
    <div class="flex justify-between me-10">
      <p class="text-2xl font-semibold">مناقلات</p>
      <OrdersAddTrans @close="refresh" />
    </div>

    <div class="flex items-end justify-between">
      <UInput
        v-model="search"
        icon="i-heroicons-magnifying-glass-20-solid"
        placeholder="بحث..."
        class="w-48"
      />
      <div class="flex flex-row gap-2 flex-nowrap">
        <UFormGroup label="من">
          <UInput v-model="fromFilter" type="date" size="xs" class="w-28" />
        </UFormGroup>
        <UFormGroup label="إلى">
          <UInput v-model="toFilter" type="date" size="xs" class="w-28" />
        </UFormGroup>
        <UFormGroup label="نوع">
          <USelectMenu
            v-model="typeFilter"
            :options="typeOptions"
            value-attribute="id"
            option-attribute="label"
            size="xs"
            class="w-28"
            :ui-menu="{ width: 'w-max' }"
          />
        </UFormGroup>
        <UFormGroup label="حالة">
          <USelectMenu
            v-model="stateFilter"
            :options="stateOptions"
            value-attribute="id"
            option-attribute="label"
            size="xs"
            class="w-28"
            :ui-menu="{ width: 'w-max' }"
          />
        </UFormGroup>
        <UButton
          square
          color="gray"
          size="xs"
          icon="i-carbon-reset"
          class="mt-auto"
          @click="
            ;(stateFilter = 0),
              (typeFilter = 9),
              (fromFilter = ''),
              (toFilter = ''),
              refresh()
          "
        />
      </div>
    </div>

    <UTable
      :columns="tableHeaders"
      :rows="tranferes.rows"
      :loading="status === 'pending'"
      :empty-state="{
        icon: 'i-heroicons-circle-stack-20-solid',
        label: 'لا يوجد نتائج',
      }"
      :ui="{
        td: { padding: 'py-1' },
        th: { padding: 'py-2' },
      }"
    >
      <template #id-data="{ row }">
        <OrdersView :ord="row.id" />
      </template>
      <template #type-data="{ row }">
        {{ row.type.label }}
      </template>
      <template #state-data="{ row }">
        {{ row.state.label }}
      </template>
      <template #dates-data="{ row }">
        <div id="datesGrid">
          <p>إنشاء</p>
          <span>{{ dateFormat(row.createdAt) }}</span>
          <p>استحقاق</p>
          <span>{{ dateFormat(row.due) }}</span>
          <p>تنفيذ</p>
          <span>{{ dateFormat(row.finished) }}</span>
        </div>
      </template>
      <template #location-data="{ row }">
        {{ `${row.branch.label} - ${row.warehouse.label}` }}
      </template>
      <template #employees-data="{ row }">
        {{ row.sales.label }}
      </template>
      <template #actions-data="{ row }">
        <OrdersEdit :ord="row.id" type="transfere" @close="refresh" />
      </template>
    </UTable>

    <div class="flex justify-center mt-auto">
      <UPagination
        v-model="page"
        :page-count="15"
        :total="tranferes.count"
        :max="5"
      />
    </div>

    <NuxtPage />
  </div>
</template>

<style>
#datesGrid {
  display: grid;
  grid-template-columns: min-content min-content;
  column-gap: 4px;
}
</style>
