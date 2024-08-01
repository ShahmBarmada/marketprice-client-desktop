<script lang="ts" setup>
definePageMeta({
  layout: 'panel',
})

const api = useAPI()
const {
  data: categories,
  status,
  refresh,
} = await useLazyAsyncData<ICategory[]>(
  'categories',
  () => $fetch(`${api.url}/categories/admin`),
  {
    default: () => [],
  }
)

async function deleteCategory(id: number) {
  await $fetch(`${api.url}/categories/${id}`, { method: 'DELETE' })
  refresh()
}

async function restoreCategory(id: number) {
  await $fetch(`${api.url}/categories/${id}/restore`)
  refresh()
}

const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'label', label: 'اسم' },
  { key: 'deletedAt', label: 'حالة' },
  { key: 'actions', label: '' },
]
</script>

<template>
  <div v-if="categories" class="space-y-4">
    <div class="flex justify-between me-10">
      <p class="text-2xl font-semibold">التصنيفات الرئيسية</p>
      <CategoriesAdd :level="1" @close="refresh" />
    </div>
    <UTable
      :columns="tableHeaders"
      :rows="categories.filter((item) => item.level === 1)"
      :loading="status === 'pending'"
      :empty-state="{
        icon: 'i-heroicons-circle-stack-20-solid',
        label: 'لا يوجد نتائج',
      }"
      :ui="{
        td: { padding: 'py-1' },
        th: { padding: 'py-2' },
        tr: { base: 'col-2btn' },
      }"
    >
      <template #label-data="{ row }">
        <NuxtLink
          :to="{ name: 'categories-ctg', params: { ctg: row.id } }"
          class="font-semibold hover:text-primary hover:underline"
          >{{ row.label }}</NuxtLink
        >
      </template>
      <template #deletedAt-data="{ row }">
        <span v-if="row.deletedAt" class="text-red-500">معطل</span>
        <span v-else class="text-primary">نشط</span>
      </template>
      <template #actions-data="{ row }">
        <UTooltip text="تعديل">
          <CategoriesEdit :ctg="row.id" :label="row.label" @close="refresh" />
        </UTooltip>
        <UTooltip v-if="!row.deletedAt" text="حذف">
          <UButton
            variant="ghost"
            icon="i-carbon-trash-can"
            color="red"
            @click="deleteCategory(row.id)"
          />
        </UTooltip>
        <UTooltip v-if="row.deletedAt" text="استعادة">
          <UButton
            variant="ghost"
            icon="i-carbon-restart"
            color="green"
            @click="restoreCategory(row.id)"
          />
        </UTooltip>
      </template>
    </UTable>
  </div>
</template>
