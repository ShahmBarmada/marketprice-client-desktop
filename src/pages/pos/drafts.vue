<script lang="ts" setup>
definePageMeta({
  layout: 'panel',
})

const api = useAPI()
const user = useUser()
const page = ref(1)
const search = ref()

const {
  data: sales,
  status,
  refresh,
} = await useLazyAsyncData<{ rows: IOrder[]; count: number }>(
  'sales',
  () =>
    $fetch(`${api.url}/orders/filter`, {
      query: {
        pg: page.value,
        lmt: 15,
        q: search.value,
        state: 1,
        type: 7,
        sales: user.user.id
      },
    }),
  {
    default: () => ({ rows: [], count: 0 }),
    watch: [page, search],
  }
)

const tableHeaders = [
  { key: 'id', label: '# رقم مرجعي' },
  { key: 'type', label: 'نوع' },
  { key: 'state', label: 'حالة' },
  { key: 'dates', label: 'تواريخ' },
  { key: 'partner', label: 'عميل' },
  { key: 'location', label: 'مخزن' },
  { key: 'employees', label: 'توصيل' },
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
</script>

<template>
  <div v-if="sales.rows" class="flex flex-col flex-nowrap h-full gap-y-4">
    <div class="flex justify-between me-10">
      <p class="text-2xl font-semibold">فواتير معلقة</p>
    </div>

    <div class="flex items-end justify-between">
      <UInput
        v-model="search"
        icon="i-heroicons-magnifying-glass-20-solid"
        placeholder="بحث..."
        class="w-48"
      />
      <div class="flex flex-row gap-2 flex-nowrap">
        <UButton
          square
          color="gray"
          size="xs"
          icon="i-carbon-reset"
          class="mt-auto"
          @click="refresh()"
        />
      </div>
    </div>

    <UTable
      :columns="tableHeaders"
      :rows="sales.rows"
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
      <template #partner-data="{ row }">
        {{ row.partner.label }}
      </template>
      <template #location-data="{ row }">
        {{ `${row.branch.label} - ${row.warehouse.label}` }}
      </template>
      <template #employees-data="{ row }">
        {{ row.delivery ? row.delivery.label : '' }}
      </template>
      <template #actions-data="{ row }">
        <OrdersEdit :ord="row.id" type="sales" @close="refresh" />
      </template>
    </UTable>

    <div class="flex justify-center mt-auto">
      <UPagination
        v-model="page"
        :page-count="15"
        :total="sales.count"
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
