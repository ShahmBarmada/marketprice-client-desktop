<script lang="ts" setup>
import * as yup from 'yup'
import type { InferType } from 'yup'
import type { FormSubmitEvent } from '#ui/types'

defineEmits<{ close: [] }>()
const props = defineProps<{ user: number }>()

const api = useAPI()
const msgErr = ref('')
const msgSucc = ref('')

const initialData = await $fetch<IUser>(`${api.url}/users/${props.user}`)

const initialState = {
  label: initialData.label,
  activated: initialData.activated,
  roleFK: initialData.roleFK,
}

const formRef = ref()
const formData = reactive({
  ...initialState,
})

const formSchema = yup.object({
  label: yup.string().required('هذا الحقل مطلوب'),
  activated: yup.boolean(),
  roleFK: yup.number().positive('هذا الحقل مطلوب'),
})

type Schema = InferType<typeof formSchema>

async function submitForm(event: FormSubmitEvent<Schema>) {
  const res = await $fetch<any>(`${api.url}/users/${props.user}`, {
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

const rolesOpt = await $fetch<IRole[]>(`${api.url}/roles`)

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
      <UFormGroup label="الاسم" name="label" required>
        <UInput v-model="formData.label" type="text" />
      </UFormGroup>
      <div class="flex flex-row flex-nowrap justify-between">
        <UFormGroup label="دور" name="roleFK" required class="basis-1/2">
          <USelectMenu
            v-model="formData.roleFK"
            :options="rolesOpt"
            value-attribute="id"
            option-attribute="label"
          />
        </UFormGroup>
        <UFormGroup
          label="تفعيل ؟"
          name="activated"
          class="place-self-center flex gap-4 items-center mx-auto"
        >
          <UToggle v-model="formData.activated" />
        </UFormGroup>
      </div>

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
