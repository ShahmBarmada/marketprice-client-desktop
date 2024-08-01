<script lang="ts" setup>
const props = defineProps<{ ord: string }>()
const api = useAPI()

const items = ref<
  {
    id: number
    label: string
    qty: number
    price: number
    note?: string
    unit: string
    rounding: number
  }[]
>([])

const { data: order } = await useAsyncData<IOrder>('order', () =>
  $fetch(`${api.url}/orders/${props.ord}`)
)
const { data: itemsRaw } = await useAsyncData<IItem[]>('items', () =>
  $fetch(`${api.url}/items/${props.ord}`)
)

items.value = itemsRaw.value!.map((item) => ({
  ...item,
  id: item.productFK,
  label: item.product!.label,
  unit: item.product!.unit!.abb,
  rounding: item.product!.unit!.rounding,
}))

const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'label', label: 'منتج' },
  { key: 'qty', label: 'كمية' },
  { key: 'price', label: 'سعر' },
  { key: 'note', label: 'ملاحظة' },
]

function calcTotal() {
  let tPrice = 0
  for (let i = 0; i < items.value.length; i++) {
    tPrice = tPrice + items.value[i].qty * items.value[i].price
  }
  return tPrice
}

function dateFormat(value: string | undefined) {
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
</script>

<template>
  <div v-if="order" class="flex flex-col gap-y-4">
    <div id="ordDetails" class="gap-2">
      <p class="font-semibold">نوع:</p>
      <p>{{ order.type?.label }}</p>
      <p class="font-semibold">حالة:</p>
      <p>{{ order.state?.label }}</p>
      <p class="font-semibold">مخزن:</p>
      <p>{{ `${order.branch?.label} / ${order.warehouse?.label}` }}</p>
      <p class="font-semibold">عميل:</p>
      <p>{{ order.partner?.label }}</p>
      <p class="font-semibold">مبيعات:</p>
      <p>{{ order.sales?.label }}</p>
      <p class="font-semibold">توصيل:</p>
      <p>{{ order.delivery ? order.delivery.label : '' }}</p>
      <div class="col-span-4 grid grid-cols-3 place-items-center">
        <p class="font-semibold">انشاء</p>
        <p class="font-semibold">استحقاق</p>
        <p class="font-semibold">تنفيذ</p>
        <p>{{ dateFormat(order.createdAt) }}</p>
        <p>{{ dateFormat(order.due) }}</p>
        <p>{{ dateFormat(order.finished) }}</p>
      </div>
    </div>
    <UTable
      :columns="tableHeaders"
      :rows="items"
      :ui="{
        td: {
          padding: 'py-1 px-1',
          font: 'first:font-semibold',
        },
        th: {
          padding: 'py-2 px-1',
        },
        tbody: 'divide-y-0',
      }"
    >
      <template #id-data="{ index }">
        {{ index + 1 }}
      </template>
      <template #qty-data="{ row }">
        {{
          `${parseFloat(row.qty).toLocaleString('en', {
            minimumFractionDigits: 2,
          })}
          ${row.unit}`
        }}
      </template>
      <template #price-data="{ row }">{{
        parseFloat(row.price).toLocaleString('en', {
          minimumFractionDigits: 2,
        })
      }}</template>
    </UTable>
    <p class="font-semibold text-center">{{ `إجمالي: ${calcTotal()}` }}</p>
  </div>
</template>

<style>
#ordDetails {
  display: grid;
  grid-template-columns: min-content 1fr min-content 1fr;
}
</style>