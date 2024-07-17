<script lang="ts" setup>
definePageMeta({
  layout: 'panel',
})

const api = useAPI()

const { data: branches, refresh: refreshBranches } = await useLazyAsyncData<IBranch[]>(
  'branches',
  () => $fetch(`${api.url}/branches/admin`),
  {
    default: () => [],
  },
)
const { data: warehouses, refresh: refreshWarehouses } = await useLazyAsyncData<IWarehouse[]>(
  'warehouses',
  () => $fetch(`${api.url}/warehouses/admin`),
  {
    default: () => [],
  },
)
const { data: units, refresh: refreshUnits } = await useLazyAsyncData<IUnit[]>(
  'units',
  () => $fetch(`${api.url}/units/admin`),
  {
    default: () => [],
  },
)

async function deleteWarehouse(id: number) {
  await $fetch(`${api.url}/warehouses/${id}`, { method: 'DELETE' })
  refreshWarehouses()
}

async function restoreWarehouse(id: number) {
  await $fetch(`${api.url}/warehouses/${id}/restore`)
  refreshWarehouses()
}

async function deleteUnit(id: number) {
  await $fetch(`${api.url}/units/${id}`, { method: 'DELETE' })
  refreshUnits()
}

async function restoreUnit(id: number) {
  await $fetch(`${api.url}/units/${id}/restore`)
  refreshUnits()
}

const branchesHeaders = [
  { key: 'id', label: '#' },
  { key: 'label', label: 'اسم' },
  { key: 'actions', label: '' },
]
const warehousesHeaders = [
  { key: 'id', label: '#' },
  { key: 'label', label: 'اسم' },
  { key: 'branchFK', label: 'فرع' },
  { key: 'deletedAt', label: 'حالة' },
  { key: 'actions', label: '' },
]
const unitsHeaders = [
  { key: 'id', label: '#' },
  { key: 'label', label: 'وصف' },
  { key: 'abb', label: 'وحدة' },
  { key: 'rounding', label: 'تقريب الكمية' },
  { key: 'deletedAt', label: 'حالة' },
  { key: 'actions', label: '' },
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between me-10">
      <p class="text-2xl font-semibold">
        إعدادات
      </p>
    </div>

    <div>
      <p class="text-xl font-semibold">
        ضبط
      </p>
      <div>
        <ul>
          <li>لاحقة باركود الميزان</li>
          <li>الفرع الافتراضي</li>
        </ul>
      </div>
    </div>

    <div>
      <div class="flex justify-between me-10">
        <p class="text-xl font-semibold">
          أفرع
        </p>
        <BranchesAdd @close="refreshBranches" />
      </div>
      <UTable
        :columns="branchesHeaders"
        :rows="branches"
        :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'لا يوجد نتائج' }"
        :ui="{ td: { padding: 'py-1' }, th: { padding: 'py-2' }, tr: { base: 'col-1btn' } }"
      >
        <template #label-data="{ row }">
          <span class="font-semibold">{{ row.label }}</span>
        </template>
        <template #actions-data="{ row }">
          <UTooltip text="تعديل">
            <BranchesEdit :id="row.id" :label="row.label" @close="refreshBranches" />
          </UTooltip>
        </template>
      </UTable>
    </div>

    <div>
      <div class="flex justify-between me-10">
        <p class="text-xl font-semibold">
          مخازن
        </p>
        <WarehousesAdd @close="refreshWarehouses" />
      </div>
      <UTable
        :columns="warehousesHeaders"
        :rows="warehouses"
        :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'لا يوجد نتائج' }"
        :ui="{ td: { padding: 'py-1' }, th: { padding: 'py-2' }, tr: { base: 'col-2btn' } }"
      >
        <template #label-data="{ row }">
          <span class="font-semibold">{{ row.label }}</span>
        </template>
        <template #branchFK-data="{ row }">
          <span>{{ row.branch.label }}</span>
        </template>
        <template #deletedAt-data="{ row }">
          <span v-if="row.deletedAt" class="text-red-500">معطل</span>
          <span v-else class="text-primary">نشط</span>
        </template>
        <template #actions-data="{ row }">
          <UTooltip text="تعديل">
            <WarehousesEdit :id="row.id" @close="refreshWarehouses" />
          </UTooltip>
          <UTooltip v-if="!row.deletedAt" text="حذف">
            <UButton
              variant="ghost"
              icon="i-carbon-trash-can"
              color="red"
              @click="deleteWarehouse(row.id)"
            />
          </UTooltip>
          <UTooltip v-if="row.deletedAt" text="استعادة">
            <UButton
              variant="ghost"
              icon="i-carbon-restart"
              color="green"
              @click="restoreWarehouse(row.id)"
            />
          </UTooltip>
        </template>
      </UTable>
    </div>

    <div>
      <div class="flex justify-between me-10">
        <p class="text-xl font-semibold">
          وحدات القياس
        </p>
        <UnitsAdd @close="refreshUnits" />
      </div>
      <UTable
        :columns="unitsHeaders"
        :rows="units"
        :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'لا يوجد نتائج' }"
        :ui="{ td: { padding: 'py-1' }, th: { padding: 'py-2' }, tr: { base: 'col-1btn' } }"
      >
        <template #label-data="{ row }">
          <span class="font-semibold">{{ row.label }}</span>
        </template>
        <template #rounding-data="{ row }">
          <span>{{ row.rounding === 0 ? "دائماً (رقم صحيح)" : row.rounding === 1 ? "لأقرب نصف" : "بدون" }}</span>
        </template>
        <template #deletedAt-data="{ row }">
          <span v-if="row.deletedAt" class="text-red-500">معطل</span>
          <span v-else class="text-primary">نشط</span>
        </template>
        <template #actions-data="{ row }">
          <UTooltip text="تعديل">
            <UnitsEdit :id="row.id" @close="refreshUnits" />
          </UTooltip>
          <UTooltip v-if="!row.deletedAt" text="حذف">
            <UButton
              variant="ghost"
              icon="i-carbon-trash-can"
              color="red"
              @click="deleteUnit(row.id)"
            />
          </UTooltip>
          <UTooltip v-if="row.deletedAt" text="استعادة">
            <UButton
              variant="ghost"
              icon="i-carbon-restart"
              color="green"
              @click="restoreUnit(row.id)"
            />
          </UTooltip>
        </template>
      </UTable>
    </div>
  </div>
</template>
