<script lang="ts" setup>
const events = defineEmits<{ close: [] }>()

const api = useAPI()
const defBranch = useBranch()
const defWh = useWH()
const branch = ref(defBranch.branch)
const wh = ref(defWh.wh)

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

function updateDefBranch(value: { id: number; label: string }) {
  branch.value = value
}

function updateDefWh(value: { id: number; label: string }) {
  wh.value = value
}

function saveConfigs() {
  defBranch.set(branch.value)
  defWh.set(wh.value)
  events('close')
  // reloadNuxtApp({ ttl: 1000 })
}
</script>

<template>
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
          ضبط
        </h3>
      </div>
    </template>

    <div class="space-y-4">
      <p>برجاء تحديد الفرع والمخزن الافتراضيين لصرف البضاعة</p>
      <div class="flex flex-row gap-x-4">
        <UFormGroup label="الفرع" :ui="{ wrapper: 'w-36' }">
          <USelectMenu
            v-model="branch"
            :options="branches"
            @change="(v) => updateDefBranch(v)"
          />
        </UFormGroup>

        <UFormGroup label="المخزن" :ui="{ wrapper: 'w-36' }">
          <USelectMenu
            v-model="wh"
            :options="
              warehouses
                .filter((item) => item.branchFK === branch.id)
                .map((item) => ({ id: item.id, label: item.label }))
            "
            :disabled="branch.id === 0 ? true : false"
            @change="(v) => updateDefWh(v)"
          />
        </UFormGroup>

        <UButton
          :disabled="branch.id === 0 || wh.id === 0"
          class="mt-auto"
          @click="saveConfigs"
          >حفظ</UButton
        >
      </div>
    </div>
  </UCard>
</template>
