<script lang="ts" setup>
import * as yup from 'yup'
import type { InferType } from 'yup'
import type { FormSubmitEvent } from '#ui/types'

const props = defineProps<{ prt: string }>()

const api = useAPI()
const msgErr = ref('')
const msgSucc = ref('')

const { data: areaOpt } = await useLazyAsyncData(
  'areas',
  () => $fetch<IArea[]>(`${api.url}/areas/admin`),
  {
    default: () => [],
  }
)

const { data: partner } = await useAsyncData<IPartner>('partner', () =>
  $fetch(`${api.url}/partners/${props.prt}`)
)

const resolveInitAddress = () => {
  if (partner.value?.addresses && partner.value?.addresses.length > 0) {
    const address = partner.value.addresses[0]
    const area = areaOpt.value.filter((item) => item.id === address.areaFK)[0]

    let lv1val: number | undefined,
      lv2val: number | undefined,
      lv3val: number | undefined,
      lv4val: number | undefined

    if (area.level === 3) {
      lv4val = undefined
      lv3val = area.id
      lv2val = area.parent
      lv1val = areaOpt.value.filter((item) => item.id === lv2val)[0].parent
    } else {
      lv4val = area.id
      lv3val = area.parent
      lv2val = areaOpt.value.filter((item) => item.id === lv3val)[0].parent
      lv1val = areaOpt.value.filter((item) => item.id === lv2val)[0].parent
    }

    return {
      lv1: lv1val,
      lv2: lv2val,
      lv3: lv3val,
      lv4: lv4val,
      areaFK: address.areaFK,
      district: address.district,
      street: address.street,
      building: address.building,
      floor: address.floor,
      apartment: address.apartment,
    }
  } else {
    return {
      lv1: undefined,
      lv2: undefined,
      lv3: undefined,
      lv4: undefined,
      areaFK: 0,
      district: undefined,
      street: undefined,
      building: undefined,
      floor: undefined,
      apartment: undefined,
    }
  }
}

const initialState = {
  label: partner.value?.label,
  phones: partner.value?.phones.join(' '),
  email: partner.value?.email ? partner.value.email : undefined,
  ...resolveInitAddress(),
}

const formRef = ref()
const formData = reactive({
  ...initialState,
})

const formSchema = yup.object({
  label: yup
    .string()
    .required('لا يمكن ترك هذا الحقل فارغ')
    .matches(
      /^[\u0041-\u005A\u0061-\u007A\u0620-\u064A0-9 ]+$/u,
      'برجاء التحقق من الاسم المدخل'
    )
    .max(50, 'الحد الأقصى هو 50 محرف'),
  phones: yup
    .string()
    .matches(
      /^(01[0-9]{9}\s*){1,3}$|^$/g,
      `برجاء التحقق من أرقام الهواتف المدخلة، 3 أرقام بحد أقصى`
    ),
  email: yup
    .string()
    .email('برجاء التحقق من البريد الإلكتروني المدخل')
    .max(50, 'الحد الأقصى هو 50 محرف'),
  lv1: yup.number(),
  lv2: yup.number(),
  lv3: yup.number(),
  lv4: yup.number(),
  areaFK: yup.number(),
  street: yup.string(),
  building: yup.string(),
  floor: yup.string(),
  apartment: yup.string(),
  district: yup.string(),
})

type Schema = InferType<typeof formSchema>

async function submitForm(event: FormSubmitEvent<Schema>) {
  msgSucc.value = ''
  msgErr.value = ''

  const partnerBody = {
    label: event.data.label,
    email: event.data.email,
    phones: event.data.phones ? event.data.phones.split(/\s+/) : [],
  }

  const addressBody = {
    areaFK: event.data.areaFK,
    district: event.data.district,
    street: event.data.street,
    building: event.data.building,
    floor: event.data.floor,
    apartment: event.data.apartment,
  }

  try {
    await $fetch(`${api.url}/partners/${props.prt}`, {
      method: 'PUT',
      body: partnerBody,
    })

    try {
      if (partner.value?.addresses && partner.value?.addresses.length > 0) {
        await $fetch(`${api.url}/addresses/${partner.value.addresses[0].id}`, {
          method: 'PUT',
          body: addressBody,
        })
        msgSucc.value = 'تم التعديل بنجاح'
      } else {
        await $fetch(`${api.url}/addresses`, {
          method: 'POST',
          body: { partnerFK: parseInt(props.prt, 10), ...addressBody },
        })
        msgSucc.value = 'تم تعديل بيانات العميل وإضافة عنوان بنجاح'
      }
    } catch {
      msgErr.value = 'حدث خطأ في عملية التعديل، برجاء اعادة المحاولة'
    }
  } catch {
    msgErr.value = 'حدث خطأ في عملية التعديل، برجاء اعادة المحاولة'
  }
}

function resolveArea(level: number, val: number) {
  switch (level) {
    case 1:
      formData.areaFK = 0
      formData.lv2 = undefined
      formData.lv3 = undefined
      formData.lv4 = undefined
      break
    case 2:
      formData.areaFK = 0
      formData.lv3 = undefined
      formData.lv4 = undefined
      break
    case 3:
      formData.areaFK = val
      formData.lv4 = undefined
      break
    case 4:
      formData.areaFK = val
      break
  }
}
</script>

<template>
  <UForm
    ref="formRef"
    :schema="formSchema"
    :state="formData"
    class="flex flex-col flex-nowrap gap-y-4"
    @submit="submitForm"
  >
    <p class="font-semibold">بيانات العميل</p>
    <div class="grid grid-cols-2 gap-4">
      <UFormGroup label="اسم" name="label" required>
        <UInput v-model="formData.label" type="text" />
      </UFormGroup>
      <UFormGroup label="ايميل" name="email">
        <UInput v-model="formData.email" type="text" />
      </UFormGroup>
      <UFormGroup label="ارقام هاتف" name="phones" class="col-span-2">
        <UInput v-model="formData.phones" type="text" />
      </UFormGroup>
    </div>
    <p class="font-semibold">العنوان</p>
    <div class="grid grid-cols-4 gap-4">
      <UFormGroup label="محافظة" name="lv1">
        <USelectMenu
          v-model="formData.lv1"
          :options="
            areaOpt
              .filter((item) => item.level === 1)
              .map((item) => ({
                id: item.id,
                label: item.label,
                disabled: item.deletedAt ? true : false,
              }))
          "
          value-attribute="id"
          option-attribute="label"
          :ui-menu="{ width: 'w-max', option: { size: 'text-xs' } }"
          @change="(val) => resolveArea(1, val)"
        />
      </UFormGroup>
      <UFormGroup label="مدينة" name="lv2">
        <USelectMenu
          v-model="formData.lv2"
          :options="
            areaOpt
              .filter((item) => item.parent === formData.lv1)
              .map((item) => ({
                id: item.id,
                label: item.label,
                disabled: item.deletedAt ? true : false,
              }))
          "
          value-attribute="id"
          option-attribute="label"
          :ui-menu="{ width: 'w-max', option: { size: 'text-xs' } }"
          :disabled="formData.lv1 === undefined"
          @change="(val) => resolveArea(2, val)"
        />
      </UFormGroup>
      <UFormGroup label="حي / منطقة" name="lv3">
        <USelectMenu
          v-model="formData.lv3"
          :options="
            areaOpt
              .filter((item) => item.parent === formData.lv2)
              .map((item) => ({
                id: item.id,
                label: item.label,
                disabled: item.deletedAt ? true : false,
              }))
          "
          value-attribute="id"
          option-attribute="label"
          :ui-menu="{ width: 'w-max', option: { size: 'text-xs' } }"
          :disabled="formData.lv2 === undefined"
          @change="(val) => resolveArea(3, val)"
        />
      </UFormGroup>
      <UFormGroup label="فرعي" name="lv4">
        <USelectMenu
          v-model="formData.lv4"
          :options="
            areaOpt
              .filter((item) => item.parent === formData.lv3)
              .map((item) => ({
                id: item.id,
                label: item.label,
                disabled: item.deletedAt ? true : false,
              }))
          "
          value-attribute="id"
          option-attribute="label"
          :ui-menu="{ width: 'w-max', option: { size: 'text-xs' } }"
          :disabled="formData.lv3 === undefined"
          @change="(val) => resolveArea(4, val)"
        />
      </UFormGroup>
      <UFormGroup label="شارع" name="street">
        <UInput
          v-model="formData.street"
          type="text"
          :disabled="
            formData.lv1 === undefined ||
            formData.lv2 === undefined ||
            formData.lv3 === undefined
          "
        />
      </UFormGroup>
      <UFormGroup label="عمارة" name="building">
        <UInput
          v-model="formData.building"
          type="text"
          :disabled="
            formData.lv1 === undefined ||
            formData.lv2 === undefined ||
            formData.lv3 === undefined
          "
        />
      </UFormGroup>
      <UFormGroup label="دور" name="floor">
        <UInput
          v-model="formData.floor"
          type="text"
          :disabled="
            formData.lv1 === undefined ||
            formData.lv2 === undefined ||
            formData.lv3 === undefined
          "
        />
      </UFormGroup>
      <UFormGroup label="شقة" name="apartment">
        <UInput
          v-model="formData.apartment"
          type="text"
          :disabled="
            formData.lv1 === undefined ||
            formData.lv2 === undefined ||
            formData.lv3 === undefined
          "
        />
      </UFormGroup>
      <UFormGroup label="ملاحظة" name="district" class="col-span-3">
        <UInput
          v-model="formData.district"
          type="text"
          :disabled="
            formData.lv1 === undefined ||
            formData.lv2 === undefined ||
            formData.lv3 === undefined
          "
        />
      </UFormGroup>
      <UButton type="submit" class="self-end justify-self-center">حفظ</UButton>

      <div class="col-span-4">
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
    </div>
  </UForm>
</template>
