<script lang="ts" setup>
import * as yup from 'yup'
import type { InferType } from 'yup'
import type { FormSubmitEvent } from '#ui/types'

const props = defineProps<{
  wh: number
}>()

const api = useAPI()
const msgErr = ref('')
const msgSucc = ref('')

const initialData = await $fetch<IWarehouse>(
  `${api.url}/warehouses/${props.wh}`
)

const initialState = {
  label: initialData.label,
  branchFK: initialData.branchFK,
}

const formRef = ref()
const formData = reactive({
  ...initialState,
})

const formSchema = yup.object({
  label: yup.string().required('هذا الحقل مطلوب'),
  branchFK: yup.number().required('هذا الحقل مطلوب'),
})

type Schema = InferType<typeof formSchema>

async function submitForm(event: FormSubmitEvent<Schema>) {
  const res = await $fetch<any>(`${api.url}/warehouses/${props.wh}`, {
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

const branchesOpt = await $fetch<IBranch[]>(`${api.url}/branches`)

function resetForm() {
  msgErr.value = ''
  msgSucc.value = ''
}
</script>

<template>
  <div>
    <UForm
      ref="formRef"
      :schema="formSchema"
      :state="formData"
      class="flex flex-col gap-y-4"
      @submit="submitForm"
    >
      <UFormGroup label="الفرع" name="branchFK" required>
        <USelectMenu
          v-model="formData.branchFK"
          :options="branchesOpt"
          value-attribute="id"
          option-attribute="label"
        />
      </UFormGroup>

      <UFormGroup label="اسم" name="label" required>
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
