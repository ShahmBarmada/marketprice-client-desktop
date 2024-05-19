<script lang="ts" setup>
import type { FormSubmitEvent } from "#ui/types";
import { z } from "zod";

definePageMeta({
  middleware: ['auth']
})

interface IloginRes {
  id: number;
  name: string;
  role: string;
  perms?: string;
}

const modalOpen = ref(false);
const serverURL = ref(localStorage.getItem('lsu') || '');
const loginErr = ref(false)

function resetLoginErr() {
  loginErr.value = false
}

const loginData = reactive({
  userName: undefined,
  userPass: undefined,
});

function saveLSU() {
  localStorage.setItem('lsu', serverURL.value)
  modalOpen.value = false;
}

async function loginSubmit(event: FormSubmitEvent<Schema>) {
  try {
    const response: IloginRes = await $fetch(serverURL.value + 'login', {
      method: "POST",
      body: { name: event.data.userName, pass: event.data.userPass },
    });
    localStorage.setItem('id', response.id.toString())
    localStorage.setItem('name', response.name)
    localStorage.setItem('role', response.role)
    localStorage.setItem('perms', (response.perms ? JSON.stringify(response.perms) : ''))
    await navigateTo('/dashboard')
  } catch {
    loginErr.value = true
  }
}

const loginSchema = z.object({
  userName: z.string({ required_error: "لا يمكن ترك هذا الحقل فارغ" }),
  userPass: z.string({ required_error: "برجاء ادخال كلمة المرور" }),
});

type Schema = z.output<typeof loginSchema>;
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <UCard class="min-w-96 max-w-96 mt-24">
      <template #header>
        <div>
          <UButton icon="i-carbon-settings" variant="link" class="absolute" @click="modalOpen = true" />
          <h1 class="text-center text-2xl font-bold text-primary">سعر السوق</h1>
        </div>
      </template>

      <UForm :schema="loginSchema" :state="loginData" @submit="loginSubmit" class="space-y-4">
        <UFormGroup label="اسم المستخدم" name="userName">
          <UInput v-model="loginData.userName" color="gray" size="lg" type="text" @change="resetLoginErr" />
        </UFormGroup>
        <UFormGroup label="كلمة المرور" name="userPass">
          <UInput v-model="loginData.userPass" color="gray" size="lg" type="password" @change="resetLoginErr" />
        </UFormGroup>
        <div class="flex flex-row flex-nowrap justify-end gap-x-4">
          <p></p>
          <ULink to="/dashboard">
            <UButton color="red">لوحة</UButton>
          </ULink>
          <UButton type="submit" icon="i-carbon-checkmark-filled" :trailing="true">دخول</UButton>
        </div>
      </UForm>

      <p v-if="loginErr" class="text-red-600 mt-4">برجاء التحقق من اسم المستخدم وكلمة المرور</p>
    </UCard>

    <UModal v-model="modalOpen">
      <div class="flex flex-col flex-nowrap p-4">
        <UFormGroup label="عنوان الخدام" name="serverURL" :ui="{ container: 'mt-2 flex flex-row flex-nowrap gap-x-4' }">
          <UInput v-model="serverURL" color="gray" size="lg" type="text" dir="ltr" :ui="{ wrapper: 'grow' }" />
          <UButton icon="i-carbon-save" @click="saveLSU">حفظ</UButton>
        </UFormGroup>
      </div>
    </UModal>
  </div>
</template>
