<script lang="ts" setup>
import * as yup from 'yup'
import type { InferType } from 'yup'
import type { FormSubmitEvent } from '#ui/types'

const props = defineProps<{
  ctg: number
}>()

const api = useAPI()
const msgErr = ref('')
const msgSucc = ref('')

const initialData = await $fetch<ICategory>(
  `${api.url}/categories/${props.ctg}`
)

const initialState = {
  level: initialData.level,
  parent: initialData.parent,
  label: initialData.label,
}

const formRef = ref()
const formData = reactive({
  ...initialState,
})

const formSchema = yup.object({
  level: yup.number().required(),
  parent: yup.number().when('level', {
    is: 2,
    then: (schema) => schema.required().positive('هذا الحقل مطلوب'),
    otherwise: (schema) => schema.required('هذا الحقل مطلوب'),
  }),
  label: yup.string().required('هذا الحقل مطلوب'),
})

type Schema = InferType<typeof formSchema>

async function submitForm(event: FormSubmitEvent<Schema>) {
  const res = await $fetch<any>(`${api.url}/categories/${props.ctg}`, {
    method: 'PUT',
    body: event.data,
  }).catch((err) => err.data)
  if (res.statusCode) {
    msgErr.value = 'حدث خطأ في عملية التعديل'
  } else {
    resetForm()
    msgSucc.value = 'تم التعديل بنجاح'
  }
}

const levelOpt = [
  { id: 1, label: 'رئيسي' },
  { id: 2, label: 'فرعي' },
]

const parentOptRaw = await $fetch<ICategory[]>(`${api.url}/categories/admin`)
const parentOpt = parentOptRaw
  .filter((item) => item.level === 1)
  .map((item) => ({
    id: item.id,
    label: item.label,
    disabled: item.deletedAt ? true : false,
  }))
  .sort((a, b) => a.id - b.id)

function resetForm() {
  msgErr.value = ''
  msgSucc.value = ''
}
</script>

<template>
  <div v-if="initialData">
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
          disabled
          @change="formData.level === 1 ? (formData.parent = 0) : null"
        />
      </UFormGroup>

      <UFormGroup label="التصنيف الرئيسي" name="parent" required>
        <USelectMenu
          v-model="formData.parent"
          :options="parentOpt"
          value-attribute="id"
          option-attribute="label"
          :disabled="formData.level === 1"
        />
      </UFormGroup>

      <UFormGroup label="عنوان التصنيف" name="label" required>
        <UInput v-model="formData.label" type="text" />
      </UFormGroup>

      <UButton type="submit" class="mx-auto"> حفظ </UButton>

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
    </UForm>
  </div>
</template>
