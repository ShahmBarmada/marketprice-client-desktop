<script lang="ts" setup>
const props = defineProps<{ type: string }>()

const emit = defineEmits<{ close: [{ id: number; label: string }] }>()

const api = useAPI()
const isOpen = ref(false)
const search = ref()
const page = ref(1)

const { data: partners, status } = await useLazyAsyncData<{
  rows: IPartner[]
  count: number
}>(
  'partners',
  () =>
    $fetch(`${api.url}/partners/filter`, {
      query: {
        pg: page.value,
        lmt: 10,
        q: search.value,
        type: props.type,
      },
    }),
  { default: () => ({ rows: [], count: 0 }), watch: [search] }
)

const tableHeaders = [
  { key: 'id', label: '# رقم مرجعي' },
  { key: 'label', label: 'اسم' },
  { key: 'phones', label: 'هاتف' },
]

function selectPrt(row: any) {
  emit('close', { id: row.id, label: row.label })
  isOpen.value = false
}
</script>

<template>
  <div>
    <UModal
      v-model="isOpen"
      prevent-close
      :ui="{ width: 'min-w-[670px] sm:max-w-max' }"
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
              اختيار عميل
            </h3>
            <UButton
              size="xs"
              color="red"
              variant="solid"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="isOpen = false"
            />
          </div>
        </template>

        <div>
          <UInput
            v-model="search"
            type="text"
            placeholder="بحث ..."
            icon="i-heroicons-magnifying-glass-20-solid"
          />
          <UTable
            :columns="tableHeaders"
            :rows="partners.rows"
            :loading="status === 'pending'"
            :empty-state="{
              icon: 'i-heroicons-circle-stack-20-solid',
              label: 'لا يوجد نتائج',
            }"
            :ui="{
              td: { padding: 'py-1' },
              th: { padding: 'py-2' },
              wrapper: 'min-h-[380px]',
            }"
            @select="selectPrt"
          >
            <template #phones-data="{ row }">
              <span>{{ row.phones.join(', ') }}</span>
            </template>
          </UTable>
          <div class="flex justify-center">
            <UPagination
              v-model="page"
              size="xs"
              :page-count="10"
              :total="partners.count"
              :max="5"
            />
          </div>
        </div>
      </UCard>
    </UModal>
    <UButton label="اختيار" @click="isOpen = true" />
  </div>
</template>
