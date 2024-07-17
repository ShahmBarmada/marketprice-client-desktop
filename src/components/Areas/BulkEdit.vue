<script lang="ts" setup>
import * as yup from 'yup'
import type { InferType } from 'yup'
import type { FormSubmitEvent } from '#ui/types'

const props = defineProps<{
  id: string
  path: string
}>()

defineEmits<{ close: [] }>()

const api = useAPI()
const isOpen = ref(false)
const msgErr = ref('')
const msgSucc = ref('')

const formRef = ref()
const formData = reactive({
  fee: 0,
})

const formSchema = yup.object({
  fee: yup.number().required('هذا الحقل مطلوب'),
})

type Schema = InferType<typeof formSchema>

async function submitForm(event: FormSubmitEvent<Schema>) {
  const res = await $fetch<any>(`${api.url}/areas/${props.id}/fee`, {
    method: 'PUT',
    body: event.data,
  }).catch(err => err.data)
  if (res.statusCode) {
    msgErr.value = 'حدث خطأ في عملية التعديل'
  }
  else {
    resetForm()
    msgSucc.value = 'تم التعديل بنجاح'
  }
}

function resetForm() {
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
              تعديل أجور هرمي
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

        <div class="space-y-4">
          <p>
            {{
              `سيتم تعديل أجور التوصيل لجميع المناطق الفرعية التابعة لـ ${$props.path}`
            }}
          </p>
          <UForm
            ref="formRef"
            :schema="formSchema"
            :state="formData"
            class="flex flex-col gap-y-4"
            @submit="submitForm"
          >
            <UFormGroup label="اجور الخدمة" name="fee">
              <UInput
                v-model="formData.fee"
                type="number"
                min="0"
                step=".01"
              />
            </UFormGroup>

            <UButton type="submit" class="mx-auto">
              تعديل
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
    <UButton label="تعديل أجور هرمي" @click="isOpen = true" />
  </div>
</template>
