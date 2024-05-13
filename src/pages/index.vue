<script lang="ts" setup>
import type { FormSubmitEvent } from '#ui/types'
import { z } from 'zod'

const loginForm = ref()
const modalOpen = ref(false)
const serverURL = ref('')

const loginData = reactive({
  userName: undefined,
  userPass: undefined
})

async function loginSubmit(event: FormSubmitEvent<Schema>) {
  console.log(event.data)
}

const loginSchema = z.object({
  userName: z.string({ required_error: 'لا يمكن ترك هذا الحقل فارغ' }),
  userPass: z.string({ required_error: 'برجاء ادخال كلمة المرور' })
})

type Schema = z.output<typeof loginSchema>

</script>

<template>
  <div class=" flex flex-col items-center justify-center">
    <UCard class="min-w-96 max-w-96 mt-24">
      <template #header>
        <div>
          <UButton icon="i-carbon-settings" variant="link" class="absolute" @click="modalOpen = true" />
          <h1 class="text-center text-2xl font-bold text-primary">سعر السوق</h1>
        </div>
      </template>

      <UForm ref="loginForm" :schema="loginSchema" :state="loginData" @submit="loginSubmit" class="space-y-4">
        <UFormGroup label="اسم المستخدم" name="userName">
          <UInput v-model="loginData.userName" color="gray" size="lg" type="text" />
        </UFormGroup>
        <UFormGroup label="كلمة المرور" name="userPass">
          <UInput v-model="loginData.userPass" color="gray" size="lg" type="password" />
        </UFormGroup>
        <div class="flex flex-row flex-nowrap justify-end gap-x-4">
          <ULink to="/pos">
            <UButton color="red">لوحة</UButton>
          </ULink>
          <UButton type="submit" icon="i-carbon-checkmark-filled" :trailing="true">دخول</UButton>
        </div>
      </UForm>

    </UCard>
    <UModal v-model="modalOpen">
      <div class="flex flex-col flex-nowrap p-4">
        <UFormGroup label="عنوان الخدام" name="serverURL" :ui="{ container: 'mt-2 flex flex-row flex-nowrap gap-x-4' }">
          <UInput v-model="serverURL" color="gray" size="lg" type="text" :ui="{ wrapper: 'grow' }" />
          <UButton icon="i-carbon-save">حفظ</UButton>
        </UFormGroup>
      </div>
    </UModal>
  </div>
</template>
