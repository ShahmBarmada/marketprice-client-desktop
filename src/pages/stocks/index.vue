<script setup lang="ts">
definePageMeta({
  layout: 'panel',
})

const api = useAPI()
const brFilter = ref()
const whFilter = ref()

const {
  data: stocks,
  status,
  refresh,
} = await useLazyAsyncData<{ id: number; product: string; sum: string }[]>(
  'stocks',
  () =>
    $fetch(`${api.url}/products/stocks/all`, {
      query: {
        br: brFilter.value,
        wh: whFilter.value,
      },
    }),
  {
    default: () => [],
    watch: [brFilter, whFilter],
  }
)

const { data: branches } = await useLazyAsyncData<IBranch[]>(
  'branches',
  () => $fetch(`${api.url}/branches/admin`),
  {
    default: () => [],
  }
)

const { data: warehouses } = await useLazyAsyncData<IWarehouse[]>(
  'warehouses',
  () => $fetch(`${api.url}/warehouses/admin`),
  {
    default: () => [],
  }
)

const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'product', label: 'منتج' },
  { key: 'sum', label: 'رصيد' },
]
</script>

<template>
  <div class="flex flex-col flex-nowrap h-full gap-y-4">
    <div class="flex justify-between me-10">
      <p class="text-2xl font-semibold">رصيد المنتجات</p>
    </div>

    <div class="flex items-end justify-end gap-x-4">
      <UFormGroup label="الفرع">
        <USelectMenu
          v-model="brFilter"
          :options="branches"
          value-attribute="id"
          option-attribute="label"
          size="xs"
          class="w-24"
          @change="whFilter = undefined"
        />
      </UFormGroup>
      <UFormGroup label="المخزن">
        <USelectMenu
          v-model="whFilter"
          :options="warehouses.filter((item) => item.branchFK === brFilter)"
          value-attribute="id"
          option-attribute="label"
          size="xs"
          class="w-24"
          :disabled="brFilter === undefined"
        />
      </UFormGroup>
      <UButton
        square
        color="gray"
        size="xs"
        icon="i-carbon-reset"
        class="mt-auto"
        @click=";(brFilter = undefined), (whFilter = undefined), refresh()"
      />
    </div>

    <UTable
      :columns="tableHeaders"
      :rows="stocks"
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
      <template #sum-data="{ row }">
        <span
          v-if="parseFloat(row.sum) < 0"
          class="text-red-500 font-semibold"
          >{{ parseFloat(row.sum).toFixed(2) }}</span
        >
        <span v-else class="font-semibold">{{
          parseFloat(row.sum).toFixed(2)
        }}</span>
      </template>
    </UTable>
  </div>
</template>
