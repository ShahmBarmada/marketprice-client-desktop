<script lang="ts" setup>
const emit = defineEmits<{
  select: [
    {
      id: number
      label: string
      qty: number
      price: number
      note: string
      unit: string
      rounding: number
    }
  ]
}>()

const api = useAPI()
const isOpen = ref(false)
const search = ref()
const page = ref(1)

const { data: products, status } = await useLazyAsyncData<{
  rows: IProduct[]
  count: number
}>(
  'products',
  () =>
    $fetch(`${api.url}/products/filter`, {
      query: {
        pg: page.value,
        lmt: 10,
        q: search.value,
        actv: 1,
      },
    }),
  { default: () => ({ rows: [], count: 0 }), watch: [search, page] }
)

const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'label', label: 'اسم' },
  { key: 'price', label: 'سعر' },
  { key: 'categoryFK', label: 'تصنيف' },
]

function selectPrd(row: any) {
  emit('select', {
    id: row.id,
    label: row.label,
    qty: 1,
    price: row.price,
    note: '',
    unit: row.unit.abb,
    rounding: row.unit.rounding
  })
}
</script>

<template>
  <div v-if="products.rows">
    <UModal v-model="isOpen" prevent-close :ui="{ width: 'sm:max-w-max' }">
      <UCard
        :ui="{
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
          body: { padding: 'p-2 sm:p-2' },
          header: { padding: 'p-2 sm:p-2' },
          footer: { padding: 'p-2 sm:p-2' },
        }"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <h3
              class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
            >
              اختيار منتج
            </h3>
            <UButton
              color="red"
              variant="solid"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              size="xs"
              @click="isOpen = false"
            />
          </div>
        </template>

        <div class="space-y-4">
          <UInput
            v-model="search"
            type="text"
            placeholder="بحث ..."
            icon="i-heroicons-magnifying-glass-20-solid"
          />
          <UTable
            :columns="tableHeaders"
            :rows="products.rows"
            :loading="status === 'pending'"
            :empty-state="{
              icon: 'i-heroicons-circle-stack-20-solid',
              label: 'لا يوجد نتائج',
            }"
            :ui="{
              td: { padding: 'py-1' },
              th: { padding: 'py-2' },
              wrapper: 'min-h-[380px]',
            }"
            @select="selectPrd"
          >
            <template #price-data="{ row }">
              {{
                parseFloat(row.price).toLocaleString('en', {
                  minimumFractionDigits: 2,
                })
              }}
            </template>
            <template #categoryFK-data="{ row }">
              <span>{{ row.category.label }}</span>
            </template>
          </UTable>
          <div class="flex justify-center">
            <UPagination
              v-model="page"
              size="xs"
              :page-count="10"
              :total="products.count"
              :max="5"
            />
          </div>
        </div>
      </UCard>
    </UModal>
    <UButton label="إضافة منتج" @click="isOpen = true" />
  </div>
</template>
