<script lang="ts" setup>
definePageMeta({
  layout: 'panel',
})

const api = useAPI()
const route = useRoute()

const {
  data: areas,
  status,
  refresh,
} = await useLazyAsyncData<IArea[]>(
  'areas',
  () => $fetch(`${api.url}/areas/admin`),
  {
    default: () => [],
  },
)

const currentArea = areas.value.filter(
  item => item.id.toString() === route.params.area,
)[0]

function resolveArea(area: IArea) {
  let lv1: IArea, lv2: IArea, lv3: IArea
  switch (area.level) {
    case 2:
      lv1 = areas.value.filter(item => item.id === area.parent)[0]
      return `${lv1.label} / ${area.label}`
    case 3:
      lv2 = areas.value.filter(item => item.id === area.parent)[0]
      lv1 = areas.value.filter(item => item.id === lv2.parent)[0]
      return `${lv1.label} / ${lv2.label} / ${area.label}`
    case 4:
      lv3 = areas.value.filter(item => item.id === area.parent)[0]
      lv2 = areas.value.filter(item => item.id === lv3.parent)[0]
      lv1 = areas.value.filter(item => item.id === lv2.parent)[0]
      return `${lv1.label} / ${lv2.label} / ${lv3.label} / ${area.label}`
    default:
      return area.label
  }
}

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
  <div v-if="areas && currentArea" class="space-y-4">
    <div class="flex justify-between me-10">
      <div>
        <p class="text-2xl font-semibold">
          {{ `مناطق الخدمة: ${currentArea.label}` }}
        </p>
        <p>{{ resolveArea(currentArea) }}</p>
      </div>
      <div class="flex flex-row gap-x-4 my-auto">
        <AreasBulkEdit :id="$route.params.area[0]" :path="resolveArea(currentArea)" @close="refresh" />
        <AreasAdd @close="refresh" />
        <UButton variant="link" @click="$router.back()">
          عودة
        </UButton>
      </div>
    </div>
    <UTable
      :columns="tableHeaders"
      :rows="areas.filter((item) => item.parent.toString() === $route.params.area)
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
        <NuxtLink
          v-if="row.level < 4"
          :to="{ name: 'areas-area', params: { area: row.id } }"
          class="font-semibold hover:text-primary hover:underline"
        >{{ row.label }}</NuxtLink>
        <span v-else class="font-semibold">{{ row.label }}</span>
      </template>
      <template #deletedAt-data="{ row }">
        <span v-if="row.deletedAt" class="text-red-500">معطل</span>
        <span v-else class="text-primary">نشط</span>
      </template>
      <template #actions-data="{ row }">
        <UTooltip text="تعديل">
          <AreasEdit :id="row.id" @close="refresh" />
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
