<script lang="ts" setup>
definePageMeta({
  layout: 'panel',
})

const api = useAPI()

const {
  data: areas,
  status,
  refresh,
} = await useLazyAsyncData<IArea[]>('areas', () => $fetch(`${api.url}/areas/admin`), {
  default: () => [],
})

async function deleteArea(id: number) {
  await $fetch(`${api.url}/areas/${id}`, { method: 'DELETE' })
  refresh()
}

async function restoreArea(id: number) {
  await $fetch(`${api.url}/areas/${id}/restore`)
  refresh()
}

const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'label', label: 'اسم' },
  { key: 'fee', label: 'خدمة' },
  { key: 'deletedAt', label: 'حالة' },
  { key: 'actions', label: '' },
]
</script>

<template>
  <div v-if="areas" class="space-y-4">
    <div class="flex justify-between me-10">
      <p class="text-2xl font-semibold">
        مناطق الخدمة : محافظات
      </p>
      <AreasAdd @close="refresh" />
    </div>
    <UTable
      :columns="tableHeaders"
      :rows="areas.filter((item) => item.level === 1)"
      :loading="status === 'pending'"
      :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'لا يوجد نتائج' }"
      :ui="{ td: { padding: 'py-1' }, th: { padding: 'py-2' }, tr: { base: 'col-2btn' } }"
    >
      <template #label-data="{ row }">
        <NuxtLink
          :to="{ name: 'areas-area', params: { area: row.id } }"
          class="font-semibold hover:text-primary hover:underline"
        >{{ row.label }}</NuxtLink>
      </template>
      <template #deletedAt-data="{ row }">
        <span v-if="row.deletedAt" class="text-red-500">معطل</span>
        <span v-else class="text-primary">نشط</span>
      </template>
      <template #actions-data="{ row }">
        <UTooltip text="تعديل">
          <AreasEdit :area="row.id" @close="refresh" />
        </UTooltip>
        <UTooltip v-if="!row.deletedAt" text="حذف">
          <UButton
            variant="ghost"
            icon="i-carbon-trash-can"
            color="red"
            @click="deleteArea(row.id)"
          />
        </UTooltip>
        <UTooltip v-if="row.deletedAt" text="استعادة">
          <UButton
            variant="ghost"
            icon="i-carbon-restart"
            color="green"
            @click="restoreArea(row.id)"
          />
        </UTooltip>
      </template>
    </UTable>
  </div>
</template>
