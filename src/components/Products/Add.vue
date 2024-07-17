<script lang="ts" setup>
import * as yup from 'yup'
import type { InferType } from 'yup'
import type { FormSubmitEvent } from '#ui/types'

defineEmits<{ close: [] }>()

const api = useAPI()
const isOpen = ref(false)
const msgErr = ref('')
const msgSucc = ref('')
const imageSrc = ref<FileList>()

const unitsData = await $fetch<IUnit[]>(`${api.url}/units`)
const categoriesRaw = await $fetch<ICategory[]>(`${api.url}/categories/admin`)

const categoriesData = categoriesRaw
  .map(item => ({
    ...item,
    order: item.level === 1 ? item.id + '' + item.parent : item.parent + '' + item.id,
    disabled: item.deletedAt ? true : false,
  }))
  .sort((a, b) => a.order.localeCompare(b.order))

const initialState = {
  label: undefined,
  price: 0,
  active: false,
  categoryFK: undefined,
  unitFK: undefined,
  barcode: '',
}

const formRef = ref()
const formData = reactive({
  ...initialState,
})

const formSchema = yup.object({
  label: yup.string().required('لا يمكن ترك هذا الحقل فارغ'),
  price: yup.number().required('لا يمكن ترك هذا الحقل فارغ').positive(' السعر يجب ان يكون أكبر من 0'),
  active: yup.boolean(),
  categoryFK: yup.number().required('لا يمكن ترك هذا الحقل فارغ'),
  unitFK: yup.number().required('لا يمكن ترك هذا الحقل فارغ'),
  barcode: yup.string().matches(/^\d+$|^$/, 'الباركود يجب ان يتكون من أرقام فقط'),
})

type Schema = InferType<typeof formSchema>

async function submitForm(event: FormSubmitEvent<Schema>) {
  msgErr.value = ''
  msgSucc.value = ''
  const body = { ...event.data }

  const reqData = new FormData()
  Object.entries(body).forEach(([key, value]) => {
    reqData.append(key, JSON.parse(JSON.stringify(value)))
  })

  if (imageSrc.value) {
    reqData.append('file', imageSrc.value[0])
  }

  const response = await $fetch<any>(`${api.url}/products`, { method: 'POST', body: reqData }).catch(err => err.data)

  if (response.statusCode) {
    if (response.message === 'barcode') {
      formRef.value.setErrors([{ message: 'هذا الباركود مستخدم من قبل', path: 'barcode' }])
    }
    else {
      msgErr.value = 'حدث خطأ في عملية الإضافة'
    }
  }
  else {
    resetForm()
    msgSucc.value = 'تم الإضافة بنجاح'
  }
}

function resetForm() {
  Object.assign(formData, initialState)
  msgErr.value = ''
  msgSucc.value = ''
}

function setImage(files: FileList) {
  imageSrc.value = files
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
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              إضافة منتج
            </h3>
            <UButton
              color="red"
              variant="solid"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="(isOpen = false), resetForm()"
            />
          </div>
        </template>

        <div>
          <UForm
            ref="formRef"
            :schema="formSchema"
            :state="formData"
            class="grid grid-cols-2 gap-4"
            @submit="submitForm"
          >
            <UFormGroup label="اسم المنتج" name="label" required>
              <UInput v-model="formData.label" type="text" />
            </UFormGroup>
            <UFormGroup label="السعر" name="price" required>
              <UInput
                v-model="formData.price"
                type="number"
                min="0"
                step=".01"
              />
            </UFormGroup>
            <UFormGroup label="التصنيف" name="categoryFK" required>
              <USelectMenu
                v-model="formData.categoryFK"
                :options="categoriesData"
                value-attribute="id"
                option-attribute="label"
              >
                <template #option="{ option: ctg }">
                  <span v-if="ctg.level > 1">{{ `-- ${ctg.label}` }}</span>
                </template>
              </USelectMenu>
            </UFormGroup>
            <UFormGroup label="الوحدة" name="unitFK" required>
              <USelectMenu
                v-model="formData.unitFK"
                :options="unitsData"
                value-attribute="id"
                option-attribute="label"
              />
            </UFormGroup>
            <UFormGroup label="باركود" name="barcode">
              <UInput v-model="formData.barcode" type="text" />
            </UFormGroup>

            <UFormGroup label="صورة" name="picture">
              <UInput
                type="file"
                size="sm"
                icon="i-heroicons-folder"
                accept="image/*"
                @change="setImage($event)"
              />
            </UFormGroup>
            <UFormGroup label="تفعيل ؟" name="active" class="place-self-center flex gap-4 items-center">
              <UToggle v-model="formData.active" />
            </UFormGroup>
            <UButton type="submit" class="place-self-center">
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
