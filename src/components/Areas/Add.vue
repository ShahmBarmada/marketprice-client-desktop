<script lang="ts" setup>
import * as yup from 'yup'
import type { InferType } from 'yup'
import type { FormSubmitEvent } from '#ui/types'

defineEmits<{ close: [] }>()

const api = useAPI()
const isOpen = ref(false)
const msgErr = ref('')
const msgSucc = ref('')

const initialState = {
  level: 0,
  parent: 0,
  label: undefined,
  fee: 0,
  lv1: undefined,
  lv2: undefined,
  lv3: undefined,
}

const formRef = ref()
const formData = reactive({
  ...initialState,
})

const formSchema = yup.object({
  level: yup.number().positive().required('هذا الحقل مطلوب'),
  label: yup.string().required('هذا الحقل مطلوب'),
  parent: yup.number().required(),
  fee: yup.number(),
  lv1: yup.number().when('level', {
    is: (val: number) => val > 1,
    then: schema => schema.positive().required('هذا الحقل مطلوب'),
  }),
  lv2: yup.number().when('level', {
    is: (val: number) => val > 2,
    then: schema => schema.positive().required('هذا الحقل مطلوب'),
  }),
  lv3: yup.number().when('level', {
    is: (val: number) => val > 3,
    then: schema => schema.positive().required('هذا الحقل مطلوب'),
  }),
})

type Schema = InferType<typeof formSchema>

async function submitForm(event: FormSubmitEvent<Schema>) {
  const res = await $fetch<any>(`${api.url}/areas`, { method: 'POST', body: event.data }).catch(err => err.data)
  if (res.statusCode) {
    msgErr.value = 'حدث خطأ في عملية الإضافة'
  }
  else {
    resetForm()
    msgSucc.value = 'تم الإضافة بنجاح'
  }
}

const levelOpt = [
  { id: 1, label: 'محافظة' },
  { id: 2, label: 'مدينة' },
  { id: 3, label: 'حي / منطقة' },
  { id: 4, label: 'مجاورة / فرعي' },
]

const { data: areaOpt } = await useLazyAsyncData('areas', () => $fetch<IArea[]>(`${api.url}/areas/admin`), {
  default: () => [],
})

function resolveArea(level: number, val?: number) {
  if (val) {
    formData.parent = val
  }
  else {
    formData.parent = 0
  }
  switch (level) {
    case 0:
      formData.lv1 = undefined
      formData.lv2 = undefined
      formData.lv3 = undefined
      break
    case 1:
      formData.lv2 = undefined
      formData.lv3 = undefined
      break
    case 2:
      formData.lv3 = undefined
      break
  }
}

function resetForm() {
  Object.assign(formData, initialState)
  msgErr.value = ''
  msgSucc.value = ''
}
</script>

<template>
  <div>
    <UModal v-model="isOpen" prevent-close :ui="{ width: 'max-w-xs sm:max-w-xs' }">
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
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              إضافة منطقة خدمة
            </h3>
            <UButton
              color="red"
              variant="solid"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="(isOpen = false), resetForm(), $emit('close')"
            />
          </div>
        </template>

        <div>
          <UForm
            ref="formRef"
            :schema="formSchema"
            :state="formData"
            class="flex flex-col gap-y-4"
            @submit="submitForm"
          >
            <UFormGroup label="المستوى" name="level" required>
              <USelectMenu
                v-model="formData.level"
                :options="levelOpt"
                value-attribute="id"
                option-attribute="label"
                @change="resolveArea(0)"
              />
            </UFormGroup>
            <UFormGroup label="محافظة" name="lv1">
              <USelectMenu
                v-model="formData.lv1"
                :options="areaOpt
                  .filter((item) => item.level === 1)
                  .map((item) => ({
                    id: item.id,
                    label: item.label,
                    disabled: item.deletedAt ? true : false,
                  }))
                "
                value-attribute="id"
                option-attribute="label"
                :disabled="formData.level < 2"
                @change="(val) => resolveArea(1, val)"
              />
            </UFormGroup>
            <UFormGroup label="مدينة" name="lv2">
              <USelectMenu
                v-model="formData.lv2"
                :options="areaOpt
                  .filter((item) => item.parent === formData.lv1)
                  .map((item) => ({
                    id: item.id,
                    label: item.label,
                    disabled: item.deletedAt ? true : false,
                  }))
                "
                value-attribute="id"
                option-attribute="label"
                :disabled="formData.level < 3"
                @change="(val) => resolveArea(2, val)"
              />
            </UFormGroup>
            <UFormGroup label="حي / منطقة" name="lv3">
              <USelectMenu
                v-model="formData.lv3"
                :options="areaOpt
                  .filter((item) => item.parent === formData.lv2)
                  .map((item) => ({
                    id: item.id,
                    label: item.label,
                    disabled: item.deletedAt ? true : false,
                  }))
                "
                value-attribute="id"
                option-attribute="label"
                :disabled="formData.level < 4"
                @change="(val) => resolveArea(3, val)"
              />
            </UFormGroup>
            <UFormGroup label="الاسم" name="label" required>
              <UInput v-model="formData.label" type="text" />
            </UFormGroup>
            <UFormGroup label="اجور الخدمة" name="fee">
              <UInput
                v-model="formData.fee"
                type="number"
                min="0"
                step=".01"
              />
            </UFormGroup>
            <UInput v-model="formData.parent" class="hidden" />
            <UButton type="submit" class="mx-auto">
              حفظ
            </UButton>
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
