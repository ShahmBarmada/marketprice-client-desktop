<script lang="ts" setup>
defineEmits<{ close: [] }>()

const props = defineProps<{
  wh: number
  label: string
}>()

const isOpen = ref(false)
</script>

<template>
  <div>
    <UModal
      v-model="isOpen"
      prevent-close
      :ui="{ width: 'max-w-xs sm:max-w-xs' }"
    >
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
              {{
                `تعديل مخزن:
              ${props.label}`
              }}
            </h3>
            <UButton
              color="red"
              variant="solid"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click=";(isOpen = false), $emit('close')"
            />
          </div>
        </template>
        <WarehousesEditForm :wh="props.wh" />
      </UCard>
    </UModal>
    <UButton variant="ghost" icon="i-carbon-edit" @click="isOpen = true" />
  </div>
</template>
