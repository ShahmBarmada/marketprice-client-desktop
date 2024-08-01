<script lang="ts" setup>
definePageMeta({
  layout: 'panel',
})

const api = useAPI()
const page = ref(1)
const search = ref()
const activeFilter = ref(undefined)

const {
  data: vendors,
  status,
  refresh,
} = await useLazyAsyncData<{ rows: IProduct[]; count: number }>(
  'vendors',
  () =>
    $fetch(`${api.url}/partners/filter`, {
      query: {
        pg: page.value,
        lmt: 15,
        q: search.value,
        actv: activeFilter.value,
        type: 'مورد',
      },
    }),
  { default: () => ({ rows: [], count: 0 }), watch: [search, activeFilter] }
)

const tableHeaders = [
  { key: 'id', label: '# رقم مرجعي' },
  { key: 'label', label: 'اسم' },
  { key: 'phones', label: 'هاتف' },
  { key: 'deletedAt', label: 'حالة' },
  { key: 'actions', label: '' },
]

const activeOptions = [
  { value: 1, label: 'نشط' },
  { value: 0, label: 'معطل' },
]
</script>

<template>
  <div v-if="vendors.rows" class="flex flex-col flex-nowrap h-full gap-y-4">
    <div class="flex justify-between me-10">
      <p class="text-2xl font-semibold">الموردين</p>
      <PartnersAdd type="مورد" @close="refresh" />
    </div>

    <div class="flex items-end justify-between">
      <UInput
        v-model="search"
        icon="i-heroicons-magnifying-glass-20-solid"
        placeholder="بحث..."
        class="w-48"
      />
      <div class="flex flex-row gap-2 flex-nowrap">
        <UFormGroup label="الحالة">
          <USelectMenu
            v-model="activeFilter"
            :options="activeOptions"
            value-attribute="value"
            option-attribute="label"
            size="xs"
            class="w-24"
            :ui-menu="{ option: { size: 'text-xs' } }"
          />
        </UFormGroup>
        <UButton
          square
          color="gray"
          size="xs"
          icon="i-carbon-reset"
          class="mt-auto"
          @click=";(activeFilter = undefined), refresh()"
        />
      </div>
    </div>

    <UTable
      :columns="tableHeaders"
      :rows="vendors.rows"
      :loading="status === 'pending'"
      :empty-state="{
        icon: 'i-heroicons-circle-stack-20-solid',
        label: 'لا يوجد نتائج',
      }"
      :ui="{
        td: { padding: 'py-1' },
        th: { padding: 'py-2' },
        tr: { base: 'col-1btn' },
      }"
    >
      <template #label-data="{ row }">
        <NuxtLink
          :to="{ name: 'vendors-prt', params: { prt: row.id } }"
          class="font-semibold hover:text-primary hover:underline"
        >
          {{ row.label }}
        </NuxtLink>
      </template>

      <template #phones-data="{ row }">
        <span>{{ row.phones.join(', ') }}</span>
      </template>

      <template #deletedAt-data="{ row }">
        <span v-if="row.deletedAt" class="text-red-500">معطل</span>
        <span v-else class="text-primary">نشط</span>
      </template>

      <template #actions-data="{ row }">
        <PartnersEdit :prt="row.id" :label="row.label" @close="refresh"/>
      </template>
    </UTable>

    <div class="flex justify-center mt-auto">
      <UPagination
        v-model="page"
        :page-count="15"
        :total="vendors.count"
        :max="5"
      />
    </div>

    <NuxtPage />
  </div>
</template>
