<script lang="ts" setup>
import * as yup from 'yup'
import { type InferType } from 'yup'
import type { FormSubmitEvent } from '#ui/types'

interface ILoginResponse {
  id: number
  name: string
  role: string
  perms?: string
}
const api = useAPI()
const user = useUser()

const modalOpen = ref(false)
const urlInput = ref(api.url)

const loginFormError = ref('')
const loginFormLoading = ref(false)

const loginForm = reactive({
  userName: undefined,
  userPass: undefined,
})

const loginFormSchema = yup.object({
  userName: yup.string().required('لا يمكن ترك هذا الحقل فارغ'),
  userPass: yup.string().required('لا يمكن ترك هذا الحقل فارغ'),
})

type Schema = InferType<typeof loginFormSchema>

async function loginFormSubmit(event: FormSubmitEvent<Schema>) {
  loginFormLoading.value = true
  try {
    const res = await $fetch<ILoginResponse>(`${api.url}/login`, {
      method: 'POST',
      body: { name: event.data.userName, pass: event.data.userPass },
    })

    user.set(res)
    navigateTo('/pos')
  } catch (err: any) {
    loginFormError.value = err.data.message
  }

  loginFormLoading.value = false
}

function saveAPI() {
  api.setURL(urlInput.value)
  modalOpen.value = false
}
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <UCard class="min-w-96 max-w-96 mt-24">
      <template #header>
        <div>
          <UButton
            icon="i-carbon-settings"
            variant="link"
            class="absolute"
            @click="modalOpen = true"
          />
          <h1 class="text-center text-2xl font-bold text-primary">سعر السوق</h1>
        </div>
      </template>

      <UForm
        :schema="loginFormSchema"
        :state="loginForm"
        class="space-y-4"
        @submit="loginFormSubmit"
      >
        <UFormGroup label="اسم المستخدم" name="userName">
          <UInput
            v-model="loginForm.userName"
            color="gray"
            size="lg"
            type="text"
            autocomplete="off"
          />
        </UFormGroup>

        <UFormGroup label="كلمة المرور" name="userPass">
          <UInput
            v-model="loginForm.userPass"
            color="gray"
            size="lg"
            type="password"
            autocomplete="off"
          />
        </UFormGroup>
        <p
          v-if="loginFormError"
          class="text-red-500 text-md text-justify capitalize"
          dir="ltr"
        >
          {{ loginFormError }}
        </p>
        <div class="flex flex-row flex-nowrap justify-end">
          <UButton
            type="submit"
            :loading="loginFormLoading"
            icon="i-carbon-checkmark-filled"
            :trailing="true"
          >
            دخول
          </UButton>
        </div>
      </UForm>
    </UCard>

    <UModal v-model="modalOpen">
      <div class="flex flex-col flex-nowrap p-4">
        <UFormGroup
          label="عنوان الخادم"
          name="urlInput"
          :ui="{ container: 'mt-2 flex flex-row flex-nowrap gap-x-4' }"
        >
          <UInput
            v-model="urlInput"
            color="gray"
            size="lg"
            type="text"
            dir="ltr"
            :ui="{ wrapper: 'grow' }"
          />
          <UButton icon="i-carbon-save" @click="saveAPI"> حفظ </UButton>
        </UFormGroup>
      </div>
    </UModal>
  </div>
</template>
