<script lang="ts" setup>
definePageMeta({
  layout: 'panel',
})

const api = useAPI()

const {
  data: users,
  status,
  refresh,
} = await useLazyAsyncData<IUser[]>(
  'users',
  () => $fetch(`${api.url}/users/admin`),
  {
    default: () => [],
  }
)

const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'label', label: 'الاسم' },
  { key: 'activated', label: 'مفعل' },
  { key: 'roleFK', label: 'الدور' },
  { key: 'actions', label: '' },
]

async function handleChange(id: number, value: boolean) {
  await $fetch(`${api.url}/users/${id}`, {
    method: 'PUT',
    body: { activated: value },
  })
}
</script>

<template>
  <div v-if="users" class="space-y-4">
    <div class="flex justify-between me-10">
      <p class="text-2xl font-semibold">الموظفين</p>
      <UsersAdd @close="refresh" />
    </div>
    <UTable
      :columns="tableHeaders"
      :rows="users"
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
        <span class="font-semibold">{{ row.label }}</span>
      </template>
      <template #activated-data="{ row }">
        <UCheckbox
          v-model="row.activated"
          @change="handleChange(row.id, row.activated)"
        />
      </template>
      <template #roleFK-data="{ row }">
        <p>{{ row.role.label }}</p>
      </template>
      <template #actions-data="{ row }">
        <UTooltip text="تعديل">
          <UsersEdit :user="row.id" :label="row.label" @close="refresh" />
        </UTooltip>
      </template>
    </UTable>
  </div>
</template>
