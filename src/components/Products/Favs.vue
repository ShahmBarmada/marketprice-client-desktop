<script lang="ts" setup>
defineEmits<{ close: [] }>()
const api = useAPI()
const user = useUser()
const isOpen = ref(false)
const search = ref()
const page = ref(1)
const selected = ref<IProduct[]>([])

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

const { data: favsRaw } = await useAsyncData<IProduct[]>(
  'favsMenu',
  () => $fetch(`${api.url}/products/favs/${user.user.id}`),
  { default: () => [] }
)

const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'label', label: 'اسم' },
  { key: 'price', label: 'سعر' },
  { key: 'categoryFK', label: 'تصنيف' },
]

function select(row: any) {
  const index = selected.value.findIndex((item) => item.id === row.id)
  if (index === -1) {
    selected.value.push(row)
  } else {
    selected.value.splice(index, 1)
  }

  const favs = []
  for (let i = 0; i < selected.value.length; i++) {
    favs.push(selected.value[i].id)
  }
  $fetch(`${api.url}/users/${user.user.id}`, {
    method: 'PUT',
    body: { favs: favs },
  })
}

selected.value = favsRaw.value
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
              المنتجات المفضلة
            </h3>
            <UButton
              color="red"
              variant="solid"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              size="xs"
              @click=";(isOpen = false), $emit('close')"
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
            v-model="selected"
            by="id"
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
              tr: { selected: 'bg-primary-100 dark:bg-primary-800/50' },
              checkbox: { padding: 'hidden' },
            }"
            @select="select"
          >
            <template #price-data="{ row }">
              {{
                parseFloat(row.price).toLocaleString('en', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
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
    <UButton label="تعديل" size="xs" @click="isOpen = true" />
  </div>
</template>
