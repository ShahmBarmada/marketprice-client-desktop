<script lang="ts" setup>
definePageMeta({
  layout: 'panel',
})

const api = useAPI()
const search = ref()
const unitFilter = ref()
const categoryFilter = ref()
const activeFilter = ref()
const page = ref(1)

const { data: units } = await useAsyncData<IUnit[]>(
  'units',
  () => $fetch(`${api.url}/units`),
  { default: () => [] }
)
const { data: categories } = await useAsyncData<ICategory[]>(
  'categories',
  () => $fetch(`${api.url}/categories`),
  {
    default: () => [],
  }
)

const {
  data: products,
  status,
  refresh,
} = await useLazyAsyncData<{ rows: IProduct[]; count: number }>(
  'prodcuts',
  () =>
    $fetch(`${api.url}/products/filter`, {
      query: {
        pg: page.value,
        lmt: 15,
        q: search.value,
        unit: unitFilter.value,
        actv: activeFilter.value,
        ctgy: categoryFilter.value,
      },
    }),
  {
    default: () => ({ rows: [], count: 0 }),
    watch: [search, page, unitFilter, categoryFilter, activeFilter],
  }
)

const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'label', label: 'اسم' },
  { key: 'price', label: 'سعر' },
  { key: 'active', label: 'مفعل' },
  { key: 'categoryLbl', label: 'تصنيف' },
  { key: 'unitLbl', label: 'وحدة' },
  { key: 'actions', label: '' },
]

const activeOptions = [
  { value: 1, label: 'مفعل' },
  { value: 0, label: 'غير مفعل' },
]

async function handleChange(id: number, value: boolean) {
  await $fetch(`${api.url}/products/${id}`, {
    method: 'PUT',
    body: { active: value },
  })
}
</script>

<template>
  <div v-if="products" class="flex flex-col flex-nowrap h-full gap-y-4">
    <div class="flex justify-between me-10">
      <p class="text-2xl font-semibold">المنتجات</p>
      <ProductsAdd @close="refresh" />
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
        <UFormGroup label="التصنيف">
          <USelectMenu
            v-model="categoryFilter"
            :options="categories"
            value-attribute="id"
            option-attribute="label"
            searchable
            clear-search-on-close
            :search-attributes="['label']"
            size="xs"
            class="w-40"
            :ui-menu="{ width: 'w-max', option: { size: 'text-xs' } }"
          />
        </UFormGroup>
        <UFormGroup label="الواحدة">
          <USelectMenu
            v-model="unitFilter"
            :options="units"
            value-attribute="id"
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
          @click="
            ;(activeFilter = null),
              (unitFilter = null),
              (categoryFilter = null),
              refresh()
          "
        />
      </div>
    </div>

    <UTable
      :columns="tableHeaders"
      :rows="
        products.rows.map((item) => ({
          ...item,
          unitLbl: item.unit?.label,
          categoryLbl: item.category?.label,
        }))
      "
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
          :to="{ name: 'products-prd', params: { prd: row.id } }"
          class="font-semibold hover:text-primary hover:underline"
        >
          {{ row.label }}
        </NuxtLink>
      </template>
      <template #price-data="{ row }">
        {{
          parseFloat(row.price).toLocaleString('en', {
            minimumFractionDigits: 2,
          })
        }}
      </template>
      <template #active-data="{ row }">
        <UCheckbox
          v-model="row.active"
          @change="handleChange(row.id, row.active)"
        />
      </template>
      <template #actions-data="{ row }">
        <UTooltip text="تعديل">
          <ProductsEdit
            :product="{
              id: row.id,
              label: row.label,
              price: row.price,
              active: row.active,
              categoryFK: row.categoryFK,
              unitFK: row.unitFK,
            }"
            @close="refresh"
          />
        </UTooltip>
      </template>
    </UTable>

    <div class="flex justify-center mt-auto">
      <UPagination
        v-model="page"
        :page-count="15"
        :total="products.count"
        :max="5"
      />
    </div>

    <NuxtPage />
  </div>
</template>
