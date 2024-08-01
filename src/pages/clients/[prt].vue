<script lang="ts" setup>
definePageMeta({
  layout: 'panel',
})

const api = useAPI()
const route = useRoute()
const page = ref(1)

const { data } = await useLazyAsyncData<IPartner>('partner', () =>
  $fetch(`${api.url}/partners/${route.params.prt}`)
)

const { data: areaOpt } = await useLazyAsyncData(
  'areas',
  () => $fetch<IArea[]>(`${api.url}/areas/admin`),
  {
    default: () => [],
  }
)

const {
  data: orders,
  status,
  refresh,
} = await useLazyAsyncData<{ rows: IOrder[]; count: number }>(
  'orders',
  () =>
    $fetch(`${api.url}/orders/filter`, {
      query: {
        pg: page.value,
        lmt: 10,
        prt: route.params.prt,
      },
    }),
  {
    default: () => ({ rows: [], count: 0 }),
    watch: [page],
  }
)

function resolveAddress() {
  if (data.value?.addresses && data.value?.addresses.length > 0) {
    const address = data.value.addresses[0]
    const area = areaOpt.value.filter((item) => item.id === address.areaFK)[0]
    let lv1: string | undefined,
      lv2: string | undefined,
      lv3: string | undefined,
      lv4: string | undefined,
      lv2Area: IArea,
      lv3Area: IArea

    if (area.level === 3) {
      lv3 = area.label
      lv2Area = areaOpt.value.filter((item) => item.id === area.parent)[0]
      lv2 = lv2Area.label
      lv1 = areaOpt.value.filter((item) => item.id === lv2Area.parent)[0].label
    } else {
      lv4 = area.label
      lv3Area = areaOpt.value.filter((item) => item.id === area.parent)[0]
      lv3 = lv3Area.label
      lv2Area = areaOpt.value.filter((item) => item.id === lv3Area.parent)[0]
      lv2 = lv2Area.label
      lv1 = areaOpt.value.filter((item) => item.id === lv2Area.parent)[0].label
    }

    return `${lv1} - ${lv2} - ${lv3}${lv4 ? ' ' + lv4 : ''} -`.concat(
      address.street ? ' شارع ' + address.street : '',
      address.building ? ' بناء ' + address.building : '',
      address.floor ? ' دور ' + address.floor : '',
      address.apartment ? ' شقة ' + address.apartment : ''
    )
  }
}

function dateFormat(value: string) {
  if (value) {
    return new Date(value).toLocaleString('ar-eg', {
      dateStyle: 'short',
      timeStyle: 'short',
      hour12: false,
      numberingSystem: 'latn',
    })
  } else {
    return ''
  }
}

const tableHeaders = [
  { key: 'id', label: '# رقم مرجعي' },
  { key: 'type', label: 'نوع' },
  { key: 'state', label: 'حالة' },
  { key: 'dates', label: 'تواريخ' },
  { key: 'partner', label: 'عميل' },
  { key: 'location', label: 'مخزن' },
  { key: 'employees', label: 'مبيعات / توصيل' },
  { key: 'actions', label: '' },
]
</script>

<template>
  <div v-if="data" class="flex flex-col flex-nowrap h-full gap-y-4">
    <div class="flex justify-between me-10">
      <p class="text-2xl font-semibold">
        {{ `عميل: ${data.label}` }}
      </p>
      <div class="flex flex-row gap-x-4">
        <PartnersEdit
          :prt="data.id.toString()"
          :label="data.label"
          btn-label="تعديل"
          @close="refresh"
        />
        <NuxtLink to="/clients">
          <UButton variant="link"> عودة </UButton>
        </NuxtLink>
      </div>
    </div>
    <div id="prtCard">
      <p class="font-semibold">رقم مرجعي:</p>
      <p>{{ data.id }}</p>
      <p class="font-semibold">اسم:</p>
      <p>{{ data.label }}</p>
      <p class="font-semibold">بريد الكتروني:</p>
      <p>{{ data.email }}</p>
      <p class="font-semibold">حالة:</p>
      <p>{{ data.deletedAt ? 'معطل' : 'نشط' }}</p>
      <p class="font-semibold">هواتف:</p>
      <p class="col-span-3">{{ data.phones.join(', ') }}</p>
      <p class="font-semibold">عنوان:</p>
      <p class="col-span-3">
        {{ data.addresses.length > 0 ? resolveAddress() : 'لا يوجد' }}
      </p>
    </div>
    <UDivider />
    <p class="text-xl font-semibold">أوردرات</p>
    <UTable
      :columns="tableHeaders"
      :rows="orders.rows"
      :loading="status === 'pending'"
      :empty-state="{
        icon: 'i-heroicons-circle-stack-20-solid',
        label: 'لا يوجد نتائج',
      }"
      :ui="{
        td: { padding: 'py-1' },
        th: { padding: 'py-2' },
      }"
    >
      <template #id-data="{ row }">
        <OrdersView :ord="row.id" />
      </template>
      <template #type-data="{ row }">
        {{ row.type.label }}
      </template>
      <template #state-data="{ row }">
        {{ row.state.label }}
      </template>
      <template #dates-data="{ row }">
        <div id="datesGrid">
          <p>إنشاء</p>
          <span>{{ dateFormat(row.createdAt) }}</span>
          <p>استحقاق</p>
          <span>{{ dateFormat(row.due) }}</span>
          <p>تنفيذ</p>
          <span>{{ dateFormat(row.finished) }}</span>
        </div>
      </template>
      <template #partner-data="{ row }">
        {{ row.partner.label }}
      </template>
      <template #location-data="{ row }">
        {{ `${row.branch.label} - ${row.warehouse.label}` }}
      </template>
      <template #employees-data="{ row }">
        <p>{{ `مبيعات: ${row.sales.label}` }}</p>
        <p>{{ `توصيل: ${row.delivery ? row.delivery.label : ''}` }}</p>
      </template>
      <template #actions-data="{ row }">
        <OrdersEdit :ord="row.id" type="sales" @close="refresh" />
      </template>
    </UTable>

    <div class="flex justify-center mt-auto">
      <UPagination
        v-model="page"
        :page-count="10"
        :total="orders.count"
        :max="5"
      />
    </div>
  </div>
</template>

<style>
#prtCard {
  display: grid;
  grid-template-columns: repeat(2, 125px auto);
  row-gap: 8px;
}
</style>
