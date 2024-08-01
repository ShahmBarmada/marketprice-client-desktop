<script lang="ts" setup>
defineEmits<{ close: [] }>()
const props = defineProps<{ prt: string; label: string; btnLabel?: string }>()
const isOpen = ref(false)
</script>

<template>
  <div>
    <UModal v-model="isOpen" prevent-close>
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
              {{ `تعديل عميل ${props.label}` }}
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

        <PartnersEditForm :prt="props.prt" />
      </UCard>
    </UModal>
    <UButton
      v-if="props.btnLabel"
      :label="props.btnLabel"
      @click="isOpen = true"
    />
    <UButton
      v-else
      variant="ghost"
      icon="i-carbon-edit"
      @click="isOpen = true"
    />
  </div>
</template>
