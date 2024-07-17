<script lang="ts" setup>
import * as yup from 'yup'
import type { InferType } from 'yup'
import type { FormSubmitEvent } from '#ui/types'

defineEmits<{ close: [] }>()
const props = defineProps<{ id: number }>()

const api = useAPI()
const isOpen = ref(false)
const msgErr = ref('')
const msgSucc = ref('')

const initialData = await $fetch<IUnit>(`${api.url}/units/${props.id}`)

const initialState = {
  label: initialData.label,
  abb: initialData.abb,
  rounding: initialData.rounding,
}

const formRef = ref()
const formData = reactive({
  ...initialState,
})

const formSchema = yup.object({
  label: yup.string().required('هذا الحقل مطلوب'),
  abb: yup.string().required('هذا الحقل مطلوب'),
  rounding: yup.number().positive('هذا الحقل مطلوب').required('هذا الحقل مطلوب'),
})

type Schema = InferType<typeof formSchema>

async function submitForm(event: FormSubmitEvent<Schema>) {
  const res = await $fetch<any>(`${api.url}/units/${props.id}`, { method: 'PUT', body: event.data }).catch(err => err.data)
  if (res.statusCode) {
    msgErr.value = 'حدث خطأ في عملية التعديل'
  }
  else {
    resetForm()
    msgSucc.value = 'تم التعديل بنجاح'
  }
}

function resetForm() {
  Object.assign(formData, initialState)
  msgErr.value = ''
  msgSucc.value = ''
}

const roundingOpt = [{ id: 0, label: 'دائما (رقم صحيح)' }, { id: 1, label: 'لأقرب نصف واحدة' }, { id: 2, label: 'بدون' }]
</script>

<template>
  <div v-if="initialData">
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
              تعديل وحدة قياس
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
            <UFormGroup label="الاسم" name="label" required>
              <UInput v-model="formData.label" type="text" />
            </UFormGroup>
            <UFormGroup label="الوحدة" name="abb" required>
              <UInput v-model="formData.abb" type="text" />
            </UFormGroup>
            <UFormGroup label="تقريب الكمية" name="rounding" required>
              <USelectMenu
                v-model="formData.rounding"
                :options="roundingOpt"
                value-attribute="id"
                option-attribute="label"
              />
              <div class="my-4 text-xs">
                <p>دائماً: سيتم تقريب الكمية دائماً لأقرب رقم صحيح</p>
                <p>لأقرب نصف: سيتم تقريب الكمية لأقرب نصف 1.0 1.5 2.0</p>
                <p>بدون: سيتم اعتماد رقم الكمية كما هو، مثلا 1.26</p>
              </div>
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
    <UButton variant="ghost" icon="i-carbon-edit" @click="isOpen = true" />
  </div>
</template>
