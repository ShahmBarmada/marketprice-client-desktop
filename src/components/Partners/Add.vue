<script lang="ts" setup>
import * as yup from 'yup'
import type { InferType } from 'yup'
import type { FormSubmitEvent } from '#ui/types'

defineEmits<{ close: [] }>()
const props = defineProps<{ type: string }>()

const api = useAPI()
const isOpen = ref(false)
const msgErr = ref('')
const msgSucc = ref('')

const { data: areaOpt } = await useLazyAsyncData(
  'areas',
  () => $fetch<IArea[]>(`${api.url}/areas/admin`),
  {
    default: () => [],
  }
)

const initialState = {
  label: undefined,
  phones: undefined,
  email: undefined,
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
  const partnerBody = {
    label: event.data.label,
    email: event.data.email,
    phones: event.data.phones ? event.data.phones.split(/\s+/) : [],
    type: props.type,
    branchFK: 1,
  }

  const addressBody = {
    areaFK: event.data.areaFK,
    district: event.data.district,
    street: event.data.street,
    building: event.data.building,
    floor: event.data.floor,
    apartment: event.data.apartment,
  }

  const resPrt = await $fetch<any>(`${api.url}/partners`, {
    method: 'POST',
    body: partnerBody,
  }).catch((err) => err.data)

  if (resPrt.statusCode) {
    if (resPrt.message === 'phone') {
      formRef.value.setErrors([
        { message: 'رقم الهاتف مستخدم سابقاً', path: 'phones' },
      ])
    } else {
      msgErr.value = 'حدث خطأ في عملية الإضافة'
    }
  } else {
    if (event.data.areaFK! > 0) {
      await $fetch(`${api.url}/addresses`, {
        method: 'POST',
        body: { partnerFK: resPrt.id, ...addressBody },
      })
    }
    resetForm()
    msgSucc.value = 'تم الإضافة بنجاح'
  }
}

function resetForm() {
  Object.assign(formData, initialState)
  msgErr.value = ''
  msgSucc.value = ''
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
              {{ `إضافة ${props.type}` }}
            </h3>
            <UButton
              color="red"
              variant="solid"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click=";(isOpen = false), resetForm(), $emit('close')"
            />
          </div>
        </template>

        <div>
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
              <UButton type="submit" class="self-end justify-self-center"
                >حفظ</UButton
              >
            </div>
          </UForm>
        </div>

        <template #footer>
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
        </template>
      </UCard>
    </UModal>
    <UButton label="إضافة" @click="isOpen = true" />
  </div>
</template>
