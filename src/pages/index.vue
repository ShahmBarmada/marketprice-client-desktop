<script lang="ts" setup>
import type { FormSubmitEvent } from "#ui/types";
import * as yup from "yup";
import { type InferType } from "yup";

definePageMeta({
  middleware: ["auth"],
});

interface ILoginResponse {
  id: number;
  name: string;
  role: string;
  perms?: string;
}

type Schema = InferType<typeof loginFormSchema>;

const modalOpen = ref(false);
const serverURL = ref(localStorage.getItem("lsu") || "");
const loginFormRef = ref();
const loginFormError = ref("");
const loginFormLoading = ref(false);
const loginFormData = reactive({
  userName: undefined,
  userPass: undefined,
});
const loginFormSchema = yup.object({
  userName: yup.string().required("لا يمكن ترك هذا الحقل فارغ"),
  userPass: yup.string().required("برجاء ادخال كلمة المرور"),
});

function saveLSU() {
  localStorage.setItem("lsu", serverURL.value);
  modalOpen.value = false;
}

async function loginFormSubmit(event: FormSubmitEvent<Schema>) {
  loginFormLoading.value = true;

  try {
    const response = await $fetch<ILoginResponse>(serverURL.value + "login", {
      method: "POST",
      body: { name: event.data.userName, pass: event.data.userPass },
    });

    localStorage.setItem("id", response.id.toString());
    localStorage.setItem("name", response.name);
    localStorage.setItem("role", response.role);
    localStorage.setItem("perms", response.perms ? JSON.stringify(response.perms) : "");

    await navigateTo("/dashboard");
  } catch (err: any) {
    loginFormError.value = err.data.message + ", Code: " + JSON.stringify(err.data.status);
  }

  loginFormLoading.value = false;
}
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

      <UForm ref="loginFormRef" :schema="loginFormSchema" :state="loginFormData" @submit="loginFormSubmit" class="space-y-4">
        <UFormGroup label="اسم المستخدم" name="userName">
          <UInput v-model="loginFormData.userName" color="gray" size="lg" type="text" autocomplete="off" />
        </UFormGroup>

        <UFormGroup label="كلمة المرور" name="userPass">
          <UInput v-model="loginFormData.userPass" color="gray" size="lg" type="password" autocomplete="off" />
        </UFormGroup>
        <p v-if="loginFormError" class="text-red-500 text-md text-justify capitalize" dir="ltr">{{ loginFormError }}</p>
        <div class="flex flex-row flex-nowrap justify-end">
          <UButton type="submit" :loading="loginFormLoading" icon="i-carbon-checkmark-filled" :trailing="true"
            >دخول
          </UButton>
        </div>
      </UForm>
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
