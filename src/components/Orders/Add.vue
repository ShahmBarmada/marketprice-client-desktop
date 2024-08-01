<script lang="ts" setup>
import * as yup from 'yup'
import type { InferType } from 'yup'
import type { FormSubmitEvent } from '#ui/types'

defineEmits<{ close: [] }>()
const props = defineProps<{ type: string }>()

const api = useAPI()
const defBranch = useBranch()
const isOpen = ref(false)
const msgErr = ref('')
const msgSucc = ref('')
const currentDate = ref(new Date())
const partner = ref({ id: 0, label: '' })
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

const initialState = {
  stateFK: undefined,
  typeFK: undefined,
  branchFK: defBranch.branch.id,
  warehouseFK: undefined,
  partnerFK: partner.value.id,
  salesFK: undefined,
  deliveryFK: undefined,
  due: undefined,
  finished: undefined,
  notes: undefined,
}
const formRef = ref()
const formData = reactive({
  ...initialState,
})

watch(barcode, () => handleBarcode(barcode.value))

const formSchema = yup.object({
  stateFK: yup.number().required('هذا الحقل مطلوب'),
  typeFK: yup.number().required('هذا الحقل مطلوب'),
  branchFK: yup.number().required('هذا الحقل مطلوب'),
  warehouseFK: yup.number().required('هذا الحقل مطلوب'),
  partnerFK: yup.number().required().positive('هذا الحقل مطلوب'),
  salesFK: yup.number().required('هذا الحقل مطلوب'),
  deliveryFK: yup.number(),
  due: yup.string(),
  finished: yup.string(),
  notes: yup.string(),
})

type Schema = InferType<typeof formSchema>

async function submitForm(event: FormSubmitEvent<Schema>) {
  msgErr.value = ''
  msgSucc.value = ''
  if (items.value.length === 0) {
    msgErr.value = 'برجاء إضافة منتجات للأوردر'
    return
  }

  const ordBody = {
    ...event.data,
    due: event.data.due ? new Date(Date.parse(event.data.due)) : undefined,
    finished: event.data.finished
      ? new Date(Date.parse(event.data.finished))
      : event.data.stateFK === 4
      ? new Date()
      : undefined,
  }

  const ordRes = await $fetch<any>(`${api.url}/orders`, {
    method: 'POST',
    body: ordBody,
  }).catch((err) => err.data)

  if (ordRes.statusCode) {
    msgErr.value = 'حدث خطأ في عملية الإضافة'
  } else {
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

    resetForm()
    msgSucc.value = 'تم الإضافة بنجاح'
  }
}

function resetForm() {
  Object.assign(formData, initialState)
  items.value = []
  partner.value = { id: 0, label: '' }
  msgErr.value = ''
  msgSucc.value = ''
}

const { data: users } = await useLazyAsyncData<IUser[]>(
  'users',
  () => $fetch(`${api.url}/users`),
  {
    default: () => [],
  }
)

const { data: branches } = await useLazyAsyncData<IBranch[]>(
  'branches',
  () => $fetch(`${api.url}/branches`),
  {
    default: () => [],
  }
)

const { data: warehouses } = await useLazyAsyncData<IWarehouse[]>(
  'warehouses',
  () => $fetch(`${api.url}/warehouses`),
  {
    default: () => [],
  }
)

const stateOpt = [
  { id: 1, label: 'مسودة' },
  { id: 2, label: 'اوردر' },
  { id: 3, label: 'قيد التنفيذ' },
  { id: 4, label: 'تم التنفيذ' },
]

const typeOpt: { id: number; label: string }[] = []

const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'label', label: 'منتج' },
  { key: 'qty', label: 'كمية' },
  { key: 'price', label: 'سعر' },
  { key: 'note', label: 'ملاحظة' },
  { key: 'actions', label: '' },
]

function resolveTypeOpt(type: string) {
  switch (type) {
    case 'sales':
      typeOpt.push({ id: 1, label: 'مبيعات' }, { id: 2, label: 'مرتجع مبيعات' })
      break
    case 'purchase':
      typeOpt.push(
        { id: 3, label: 'مشتريات' },
        { id: 4, label: 'مرتجع مشتريات' }
      )
      break
    case 'transfere':
      typeOpt.push({ id: 5, label: 'إخراج' }, { id: 6, label: 'إدخال' })
      break
    default:
      typeOpt.push(
        { id: 1, label: 'مبيعات' },
        { id: 2, label: 'مرتجع مبيعات' },
        { id: 3, label: 'مشتريات' },
        { id: 4, label: 'مرتجع مشتريات' },
        { id: 5, label: 'إخراج' },
        { id: 6, label: 'إدخال' }
      )
      break
  }
}

function handlePartner(value: { id: number; label: string }) {
  ;(formData.partnerFK = value.id), (partner.value = value)
}

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

resolveTypeOpt(props.type)
</script>
<template>
  <div>
    <UModal v-model="isOpen" prevent-close :ui="{ width: 'sm:max-w-5xl' }">
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
              إضافة اوردر
            </h3>
            <UButton
              color="red"
              variant="solid"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              size="xs"
              @click=";(isOpen = false), resetForm(), $emit('close')"
            />
          </div>
        </template>

        <div class="flex flex-row flex-nowrap gap-4">
          <UForm
            ref="formRef"
            :schema="formSchema"
            :state="formData"
            class="basis-2/5 grid grid-cols-2 gap-4 shrink-0 mb-auto"
            @submit="submitForm"
          >
            <UFormGroup label="نوع العملية" name="typeFK">
              <USelectMenu
                v-model="formData.typeFK"
                :options="typeOpt"
                value-attribute="id"
                option-attribute="label"
              />
            </UFormGroup>
            <UFormGroup label="حالة الأوردر" name="stateFK">
              <USelectMenu
                v-model="formData.stateFK"
                :options="stateOpt"
                value-attribute="id"
                option-attribute="label"
              />
            </UFormGroup>

            <UFormGroup label="فرع" name="branchFK">
              <USelectMenu
                v-model="formData.branchFK"
                :options="branches"
                value-attribute="id"
                option-attribute="label"
              />
            </UFormGroup>
            <UFormGroup label="مخزن" name="warehouseFK">
              <USelectMenu
                v-model="formData.warehouseFK"
                :options="
                  warehouses.filter(
                    (item) => item.branchFK === formData.branchFK
                  )
                "
                value-attribute="id"
                option-attribute="label"
                :disabled="formData.branchFK === undefined"
              />
            </UFormGroup>

            <UFormGroup label="تاريخ الاستحقاق" name="due">
              <UInput
                v-model="formData.due"
                type="datetime-local"
                :min="currentDate.toISOString().slice(0, 16)"
              />
            </UFormGroup>
            <UFormGroup label="تاريخ التنفيذ" name="finished">
              <UInput
                v-model="formData.finished"
                type="datetime-local"
                :min="currentDate.toISOString().slice(0, 16)"
              />
            </UFormGroup>

            <UFormGroup :label="props.type === 'sales' ? 'مبيعات' : 'مشتري'" name="salesFK">
              <USelectMenu
                v-model="formData.salesFK"
                :options="users.filter((item) => item.roleFK <= 4)"
                value-attribute="id"
                option-attribute="label"
              />
            </UFormGroup>
            <UFormGroup label="مندوب توصيل" name="deliveryFK">
              <UInputMenu
                v-model="formData.deliveryFK"
                :options="users.filter((item) => item.roleFK === 5)"
                value-attribute="id"
                option-attribute="label"
                nullable
                :popper="{ placement: 'bottom-start' }"
              />
            </UFormGroup>

            <UFormGroup
              label="عميل"
              name="partnerFK"
              :ui="{
                wrapper: 'col-span-2',
                container: 'flex flex-row gap-x-4',
              }"
            >
              <PartnersSelect :type="props.type === 'sales' ? 'عميل' : 'مورد'" @close="(e) => handlePartner(e)" />
              <UInput
                v-model="partner.label"
                type="text"
                :readonly="true"
                class="grow"
              />
            </UFormGroup>

            <UFormGroup label="ملاحظات" name="notes" class="col-span-2">
              <UInput v-model="formData.notes" type="text" />
            </UFormGroup>

            <div class="col-span-2 space-y-4 flex flex-col items-center">
              <div class="text-center text-lg font-semibold">
                <span class="me-2">الإجمالي:</span>
                <span>{{ calcTotal().toFixed(2) }}</span>
              </div>
              <UButton type="submit" label="حفظ" />
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
            </div>
          </UForm>

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
      </UCard>
    </UModal>
    <UButton label="إضافة" @click="isOpen = true" />
  </div>
</template>
