<script lang="ts" setup>
definePageMeta({
  layout: 'panel',
})

const api = useAPI()
const route = useRoute()

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

const category = categories.value.filter(
  (item) => item.id.toString() === route.params.ctg
)[0]

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
  { key: 'label', label: 'التصنيف' },
  { key: 'deletedAt', label: 'الحالة' },
  { key: 'actions', label: '' },
]
</script>

<template>
  <div v-if="categories" class="space-y-4">
    <div class="flex justify-between me-10">
      <p class="text-2xl font-semibold">
        {{ `التصنيفات الفرعية: ${category.label}` }}
      </p>
      <div class="flex flex-row gap-x-4">
        <CategoriesAdd :level="2" @close="refresh" />
        <UButton variant="link" @click="$router.back()"> عودة </UButton>
      </div>
    </div>
    <UTable
      :columns="tableHeaders"
      :rows="
        categories.filter(
          (item) => item.parent.toString() === $route.params.ctg
        )
      "
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
        <span class="font-semibold">{{ row.label }}</span>
      </template>
      <template #deletedAt-data="{ row }">
        <p class="text-red-500">
          {{ row.deletedAt ? 'معطل' : '' }}
        </p>
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
