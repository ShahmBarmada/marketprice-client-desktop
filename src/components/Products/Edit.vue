<script lang="ts" setup>
import * as yup from "yup";
import type { InferType } from "yup";
import type { FormSubmitEvent } from "#ui/types";

const props = defineProps<{
  product: {
    id: number;
    label: string;
    price: number;
    active: boolean;
    categoryFK: number;
    unitFK: number;
  };
  btnLabel?: string;
}>();

const emit = defineEmits<{ close: [] }>();

const api = useAPI();
const isOpen = ref(false);
const msgErr = ref("");
const msgSucc = ref("");

const unitsData = await $fetch<IUnit[]>(`${api.url}/units`);
const categoriesRaw = await $fetch<ICategory[]>(`${api.url}/categories`);

const categoriesData = categoriesRaw
  .map((item) => ({
    ...item,
    order: item.level === 1 ? item.id + "" + item.parent : item.parent + "" + item.id,
  }))
  .sort((a, b) => a.order.localeCompare(b.order));

const initialState = {
  label: props.product.label,
  price: props.product.price,
  active: props.product.active,
  categoryFK: props.product.categoryFK,
  unitFK: props.product.unitFK,
};
const formRef = ref();
const formData = reactive({
  ...initialState,
});
const formSchema = yup.object({
  label: yup.string().required("لا يمكن ترك هذا الحقل فارغ"),
  price: yup.number().required("لا يمكن ترك هذا الحقل فارغ").positive(" السعر يجب ان يكون أكبر من 0"),
  active: yup.boolean(),
  categoryFK: yup.number().required("لا يمكن ترك هذا الحقل فارغ"),
  unitFK: yup.number().required("لا يمكن ترك هذا الحقل فارغ"),
});

type Schema = InferType<typeof formSchema>;

async function submitForm(event: FormSubmitEvent<Schema>) {
  msgErr.value = "";
  msgSucc.value = "";

  const res = await $fetch<any>(`${api.url}/products/${props.product.id}`, { method: "PUT", body: event.data }).catch(
    (err) => err.data
  );

  if (res.statusCode) {
    msgErr.value = "حدث خطأ في عملية التعديل";
  } else {
    msgSucc.value = "تم التعديل بنجاح";
  }
}

function resetForm() {
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
              {{ `تعديل للمنتج: ${product.label}` }}
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
            class="grid grid-cols-2 gap-4"
            @submit="submitForm"
          >
            <UFormGroup label="اسم المنتج" name="label" required>
              <UInput v-model="formData.label" type="text" />
            </UFormGroup>
            <UFormGroup label="السعر" name="price" required>
              <UInput v-model="formData.price" type="number" min="0" step=".01" />
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
            <UFormGroup label="تفعيل ؟" name="active" class="place-self-center flex gap-4 items-center">
              <UToggle v-model="formData.active" />
            </UFormGroup>
            <UButton type="submit" class="place-self-center">حفظ</UButton>
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
    <UButton v-if="btnLabel" :label="btnLabel" icon="i-carbon-edit" @click="isOpen = true" />
    <UButton v-if="!btnLabel" variant="link" size="sm" icon="i-carbon-edit" @click="isOpen = true" />
  </div>
</template>
