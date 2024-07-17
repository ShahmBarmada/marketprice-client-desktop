<script lang="ts" setup>
import * as yup from 'yup'
import type { InferType } from 'yup'
import type { FormSubmitEvent } from '#ui/types'

defineEmits<{ close: [] }>()

const props = defineProps<{
  id: number
}>()

const api = useAPI()
const isOpen = ref(false)
const msgErr = ref('')
const msgSucc = ref('')

const initialData = await $fetch<IWarehouse>(`${api.url}/warehouses/${props.id}`)

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
  const res = await $fetch<any>(`${api.url}/warehouses/${props.id}`, { method: 'PUT', body: event.data }).catch(err => err.data)
  if (res.statusCode) {
    msgErr.value = 'حدث خطأ في عملية التعديل'
  }
  else {
    resetForm()
    msgSucc.value = 'تم التعديل بنجاح'
  }
}

const branchesOpt = await $fetch<IBranch[]>(`${api.url}/branches`)

function resetForm() {
  Object.assign(formData, initialState)
  msgErr.value = ''
  msgSucc.value = ''
}
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
              {{
                `تعديل مخزن:
              ${initialData.label}`
              }}
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
