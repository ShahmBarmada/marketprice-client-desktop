<script lang="ts" setup>
const props = defineProps<{ ord: string }>()
const isOpen = ref(false)
</script>

<template>
  <div>
    <UModal v-model="isOpen">
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
              {{ `اوردر ${props.ord}` }}
            </h3>
            <UButton
              color="red"
              variant="solid"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              size="xs"
              @click="isOpen = false"
            />
          </div>
        </template>

        <OrdersViewForm :ord="props.ord" />
      </UCard>
    </UModal>
    <span
      class="font-semibold cursor-pointer hover:text-primary hover:underline"
      @click="isOpen = true"
      >{{ props.ord }}</span
    >
  </div>
</template>
