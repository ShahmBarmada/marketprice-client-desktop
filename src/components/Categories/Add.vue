<script lang="ts" setup>
import * as yup from 'yup'
import type { InferType } from 'yup'
import type { FormSubmitEvent } from '#ui/types'

defineEmits<{ close: [] }>()

const props = defineProps<{
  level: number
}>()

const api = useAPI()
const isOpen = ref(false)
const msgErr = ref('')
const msgSucc = ref('')

const initialState = {
  level: props.level,
  parent: 0,
  label: undefined,
}

const formRef = ref()
const formData = reactive({
  ...initialState,
})

const formSchema = yup.object({
  level: yup.number().required(),
  parent: yup.number().when('level', {
    is: 2,
    then: schema => schema.required().positive('هذا الحقل مطلوب'),
    otherwise: schema => schema.required('هذا الحقل مطلوب'),
  }),
  label: yup.string().required('هذا الحقل مطلوب'),
})

type Schema = InferType<typeof formSchema>

async function submitForm(event: FormSubmitEvent<Schema>) {
  const res = await $fetch<any>(`${api.url}/categories`, { method: 'POST', body: event.data }).catch(err => err.data)
  if (res.statusCode) {
    msgErr.value = 'حدث خطأ في عملية الإضافة'
  }
  else {
    resetForm()
    msgSucc.value = 'تم الإضافة بنجاح'
  }
}

const levelOpt = [
  { id: 1, label: 'رئيسي' },
  { id: 2, label: 'فرعي' },
]

const parentOptRaw = await $fetch<ICategory[]>(`${api.url}/categories`)
const parentOpt = parentOptRaw
  .filter(item => item.level === 1)
  .map(item => ({ id: item.id, label: item.label }))
  .sort((a, b) => a.id - b.id)

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
              إضافة تصنيف
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
