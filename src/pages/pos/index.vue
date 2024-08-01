<script lang="ts" setup>
definePageMeta({
  layout: 'panel',
})

const api = useAPI()
const isOpen = ref(false)
const branch = useBranch()
const wh = useWH()
const user = useUser()
const msgErr = ref('')
const msgSucc = ref('')
const type = ref(1)
const barcode = ref()
const items = ref<
  {
    id: number
    label: string
    qty: number
    price: number
    note: string
    unit: string
    rounding: number
  }[]
>([])

onMounted(() => {
  if (wh.wh.id === 0 || branch.branch.id === 0) {
    isOpen.value = true
  }
})

watch(barcode, () => handleBarcode(barcode.value))
watch(items.value, () => ((msgErr.value = ''), (msgSucc.value = '')))

async function submit(state: number) {
  msgErr.value = ''
  msgSucc.value = ''

  if (items.value.length === 0) {
    msgErr.value = 'برجاء إضافة منتجات للأوردر'
    return
  }

  const ordBody = {
    stateFK: state,
    typeFK: type.value,
    branchFK: branch.branch.id,
    warehouseFK: wh.wh.id,
    partnerFK: 1,
    salesFK: user.user.id,
    finished: state === 4 ? new Date() : undefined,
  }

  try {
    const ordRes = await $fetch<any>(`${api.url}/orders`, {
      method: 'POST',
      body: ordBody,
    })

    const itemsBody = items.value.map((item, index) => ({
      orderFK: parseInt(ordRes.id),
      line: index + 1,
      note: item.note,
      qty: item.qty,
      price: item.price,
      productFK: item.id,
    }))

    await $fetch(`${api.url}/items`, {
      method: 'POST',
      body: { items: itemsBody },
    })

    msgSucc.value = 'تم الحفظ بنجاح'
  } catch {
    msgErr.value = 'حدث خطأ في عملية الحفظ'
  }
}

function resetForm() {
  type.value = 1
  items.value = []
  msgErr.value = ''
  msgSucc.value = ''
}

const typeOpt = [
  { id: 1, label: 'مبيعات' },
  { id: 2, label: 'مرتجع مبيعات' },
]

const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'label', label: 'منتج' },
  { key: 'qty', label: 'كمية' },
  { key: 'price', label: 'سعر' },
  { key: 'note', label: 'ملاحظة' },
  { key: 'actions', label: '' },
]

async function handleBarcode(code?: string) {
  if (code) {
    try {
      const product = await $fetch<IProduct>(
        `${api.url}/products/barcode/${code}`
      )

      items.value.push({
        id: product.id,
        label: product.label,
        qty: 0,
        price: product.price,
        note: '',
        unit: product.unit!.abb,
        rounding: product.unit!.rounding,
      })

      barcode.value = ''
    } catch {
      barcode.value = ''
    }
  }
}

function addItem(e: any) {
  items.value.push(e)
}

function addFav(prd: IProduct) {
  items.value.push({
    id: prd.id,
    label: prd.label,
    qty: 1,
    price: prd.price,
    note: '',
    unit: prd.unit!.abb,
    rounding: prd.unit!.rounding,
  })
}

function updateCell(index: number, value: any, property: string) {
  switch (property) {
    case 'qty':
      items.value[index].qty = value
      break
    case 'note':
      items.value[index].note = value
      break
    case 'price':
      items.value[index].price = value
      break
  }
}

function removeItem(index: number) {
  items.value.splice(index, 1)
}

function calcTotal() {
  let tPrice = 0
  for (let i = 0; i < items.value.length; i++) {
    tPrice = tPrice + items.value[i].qty * items.value[i].price
  }
  return tPrice
}

const { execute, data: favs } = await useAsyncData<IProduct[]>(
  'favs',
  () => $fetch(`${api.url}/products/favs/${user.user.id}`),
  { default: () => [] }
)
</script>

<template>
  <div class="flex flex-col flex-nowrap gap-y-4 h-full">
    <p class="text-2xl font-semibold">نقطة بيع</p>

    <div class="flex flex-row flex-nowrap gap-4 grow">
      <div class="basis-1/3 shrink-0 flex flex-col gap-y-4 px-4">
        <div class="flex flex-row gap-x-4">
          <USelectMenu
            v-model="type"
            :options="typeOpt"
            value-attribute="id"
            option-attribute="label"
            class="w-32"
          />

          <div class="text-lg font-semibold">
            <span class="me-2">الإجمالي:</span>
            <span>{{ calcTotal().toFixed(2) }}</span>
          </div>
        </div>

        <div class="flex flex-row flex-nowrap gap-x-4 mx-auto">
          <UButton label="اعتمد" @click="submit(4)" />
          <UButton label="تعليق" @click="submit(1)" />
          <UButton label="جديد" @click="resetForm" />
          <OrdersPrint />
        </div>

        <UAlert
          v-if="msgErr.length > 0"
          color="red"
          variant="subtle"
          :ui="{ description: 'text-center' }"
        >
          <template #description>
            {{ msgErr }}
          </template>
        </UAlert>
        <UAlert
          v-if="msgSucc.length > 0"
          color="green"
          variant="subtle"
          :ui="{ description: 'text-center' }"
        >
          <template #description>
            {{ msgSucc }}
          </template>
        </UAlert>

        <div class="grow mt-4 flex flex-col flex-nowrap gap-y-4">
          <div class="flex justify-between items-center">
            <p class="font-semibold">إضافة سريعة</p>
            <ProductsFavs @close="execute" />
          </div>
          <div class="flex flex-row flex-wrap gap-2">
            <UBadge
              v-for="(fav, key) in favs"
              :key="key"
              variant="subtle"
              class="cursor-pointer"
              @click="addFav(fav)"
              >{{ fav.label }}</UBadge
            >
          </div>
        </div>
      </div>

      <div class="grow flex flex-col gap-4">
        <div class="flex flex-row justify-between">
          <p class="text-lg font-semibold">المنتجات</p>
          <div class="flex flex-row justify-around gap-4 mx-4">
            <UInput v-model="barcode" type="text" placeholder="باركود" />
            <ProductsSelect @select="(e) => addItem(e)" />
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
          <template #qty-data="{ row, index }">
            <UInput
              type="number"
              min="0"
              :step="
                row.rounding === 2 ? '.01' : row.rounding === 1 ? '.5' : '1'
              "
              :value="row.qty"
              @blur="(e) => updateCell(index, e.target.value, 'qty')"
              ><template #trailing
                ><span class="text-xs">{{ row.unit }}</span></template
              ></UInput
            >
          </template>
          <template #price-data="{ row, index }">
            <UInput
              type="number"
              min="0"
              step=".01"
              :value="row.price"
              @blur="(e) => updateCell(index, e.target.value, 'price')"
            />
          </template>
          <template #note-data="{ row, index }">
            <UInput
              type="text"
              :value="row.note"
              @blur="(e) => updateCell(index, e.target.value, 'note')"
            />
          </template>
          <template #actions-data="{ index }">
            <UButton
              color="red"
              variant="ghost"
              icon="i-heroicons-minus-circle-16-solid"
              size="2xs"
              @click="removeItem(index)"
            />
          </template>
        </UTable>
      </div>
    </div>
    <UModal
      v-model="isOpen"
      prevent-close
      :ui="{ width: 'max-w-sm sm:max-w-sm' }"
    >
      <ConfigsDefaults
        @close=";(isOpen = false), reloadNuxtApp({ ttl: 1000 })"
      />
    </UModal>
  </div>
</template>
