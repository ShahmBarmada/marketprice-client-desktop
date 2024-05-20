<script lang="ts" setup>
import * as yup from "yup";
import { type InferType } from "yup";
import type { FormSubmitEvent } from "#ui/types";

definePageMeta({
  layout: "panel",
});

const partnersTypes = [
  { id: 1, label: "عميل" },
  { id: 2, label: "مورد" },
];

const lsu = useLSU();
const formRef = ref();
const formError = ref("");
const formLoading = ref(false);
const activatedHelper = ref(true);
const typeHelper = ref(partnersTypes[0].id);

const formData = reactive({
  nameInput: undefined,
  phonesInput: undefined,
  emailInput: undefined,
  activatedInput: activatedHelper.value,
  typeInput: typeHelper.value,
});

const formSchema = yup.object({
  nameInput: yup
    .string()
    .required("برجاء ادخال الاسم")
    .matches(/^[\u0041-\u005A\u0061-\u007A\u0620-\u064A0-9 ]+$/u, "برجاء التحقق من الاسم المدخل")
    .max(50, "الحد الأقصى هو 50 محرف"),
  phonesInput: yup
    .string()
    .required("برجاء ادخال رقم هاتف واحد على الأقل")
    .matches(/^(01[0-9]{9}\s*){1,3}$/, "برجاء التحقق من أرقام الهواتف المدخلة،3 أرقام بحد أقصى"),
  emailInput: yup.string().email("برجاء التحقق من البريد الإلكتروني المدخل").max(50, "الحد الأقصى هو 50 محرف"),
  activatedInput: yup.boolean(),
  typeInput: yup.number(),
});

type FormSchema = InferType<typeof formSchema>;

async function formSubmit(event: FormSubmitEvent<FormSchema>) {
  formLoading.value = true;

  const resquestBody = {
    name: event.data.nameInput,
    phones: event.data.phonesInput.split(/\s+/),
    email: event.data.emailInput,
    activated: event.data.activatedInput ? new Date() : undefined,
    type: event.data.typeInput,
  };

  try {
    const response = await $fetch(lsu + "partners", {
      method: "POST",
      body: { ...resquestBody },
    });
  } catch (err: any) {
    if (err.statusCode === 422) {
      formRef.value.setErros(
        err.data.errors.map((err: any) => ({
          message: err.message,
          path: err.path,
        }))
      );
    } else {
      console.log(err);
    }
  }

  formLoading.value = false;
}
</script>

<template>
  <div>
    <div class="max-w-xs border border-gray-400 rounded-md p-4">
      <UForm ref="formRef" :schema="formSchema" :state="formData" @submit="formSubmit" class="space-y-4">
        <UFormGroup label="الاسم:" name="nameInput" required>
          <UInput v-model="formData.nameInput" color="gray" size="md" type="text" />
        </UFormGroup>
        <UFormGroup label="أرقام هاتف:" name="phonesInput" required hint="بحد أقصى 3 أرقام">
          <UInput v-model="formData.phonesInput" color="gray" size="md" type="text" />
        </UFormGroup>
        <UFormGroup label="البريد الالكتروني:" name="emailInput" hint="اختياري">
          <UInput v-model="formData.emailInput" color="gray" size="md" type="text" />
        </UFormGroup>
        <div class="flex flex-row flex-nowrap justify-between items-center">
          <UFormGroup name="type" label="نوع الحساب:" class="w-1/2">
            <UInputMenu
              v-model="formData.typeInput"
              :options="partnersTypes"
              value-attribute="id"
              option-attribute="label"
              name="typeInput"
            />
          </UFormGroup>
          <UCheckbox
            v-model="formData.activatedInput"
            name="activatedInput"
            label="تفعيل ؟"
            :ui="{ inner: 'order-first m-0', container: 'ms-3' }"
          />
        </div>
        <div class="flex flex-row flex-nowrap justify-end">
          <UButton type="submit" :loading="formLoading">حفظ</UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>

<style></style>
