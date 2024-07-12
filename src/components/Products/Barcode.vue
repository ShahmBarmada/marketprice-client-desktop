<script lang="ts" setup>
import * as yup from "yup";
import type { InferType } from "yup";
import type { FormSubmitEvent } from "#ui/types";

const props = defineProps<{
  id: number;
  label: string;
  btn: string;
}>();
const emit = defineEmits<{ close: [] }>();

const api = useAPI();
const isOpen = ref(false);
const msgErr = ref("");
const msgSucc = ref("");
const initialState = {
  value: undefined,
};
const formRef = ref();
const formData = reactive({
  ...initialState,
});
const formSchema = yup.object({
  value: yup.string().matches(/^\d+$/, "الباركود يجب ان يتكون من أرقام فقط"),
});

type Schema = InferType<typeof formSchema>;

async function submitForm(event: FormSubmitEvent<Schema>) {
  msgErr.value = "";
  msgSucc.value = "";

  const res = await $fetch<any>(`${api.url}/barcodes`, {
    method: "POST",
    body: { value: event.data.value, productFK: props.id },
  }).catch((err) => err.data);
  if (res.statusCode) {
    if (res.message === "barcode") {
      formRef.value.setErrors([{ message: "هذا الباركود مستخدم من قبل", path: "value" }]);
    } else {
      msgErr.value = "حدث خطأ في عملية الإضافة";
    }
  } else {
    resetForm();
    msgSucc.value = "تم الإضافة بنجاح";
  }
}

function resetForm() {
  Object.assign(formData, initialState);
  msgErr.value = "";
  msgSucc.value = "";
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
              {{ `إضافة باركود للمنتج: ${label}` }}
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
            class="flex flex-row flex-nowrap gap-4 items-center"
            @submit="submitForm"
          >
            <UFormGroup label="الباركود" name="value" required class="grow">
              <UInput v-model="formData.value" type="text" />
            </UFormGroup>
            <UButton type="submit">حفظ</UButton>
          </UForm>
        </div>

        <template #footer>
          <UAlert v-if="msgErr.length > 0" color="red" variant="subtle" :ui="{ description: 'text-center' }">
            <template #description>
              {{ msgErr }}
            </template>
          </UAlert>
          <UAlert v-if="msgSucc.length > 0" color="green" variant="subtle" :ui="{ description: 'text-center' }">
            <template #description>
              {{ msgSucc }}
            </template>
          </UAlert>
        </template>
      </UCard>
    </UModal>
    <UButton :label="props.btn" icon="i-carbon-barcode" @click="isOpen = true" />
  </div>
</template>
