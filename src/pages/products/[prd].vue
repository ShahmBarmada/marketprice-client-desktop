<script lang="ts" setup>
definePageMeta({
  layout: 'panel',
})

const api = useAPI()
const route = useRoute()
const page = ref(1)

const { data, refresh } = await useLazyAsyncData<IProduct>('product', () =>
  $fetch(`${api.url}/products/${route.params.prd}`)
)

const { data: stocks } = await useLazyAsyncData<IStock[]>(
  'stocks',
  () => $fetch(`${api.url}/products/stocks/${route.params.prd}`),
  { default: () => [] }
)

const { data: moves } = await useLazyAsyncData<{rows: IMove[], count: {count: number}}>(
  'moves',
  () =>
    $fetch(`${api.url}/products/moves/${route.params.prd}`, {
      query: { pg: page.value, lmt: 10 },
    })
)

const stocksHeaders = [
  { key: 'branch', label: 'فرع' },
  { key: 'warehouse', label: 'مخزن' },
  { key: 'sum', label: 'رصيد' },
]

const movesHeaders = [
  { key: 'id', label: '# اوردر' },
  { key: 'date', label: 'تاريخ' },
  { key: 'branch', label: 'فرع' },
  { key: 'warehouse', label: 'مخزن' },
  { key: 'qty', label: 'كمية' },
  { key: 'price', label: 'سعر' },
  { key: 'note', label: 'ملاحظات' },
  { key: 'type', label: 'عملية' },
]

async function removeImage(productId: number) {
  await $fetch(`${api.url}/images/${productId}`, { method: 'DELETE' })
  refresh()
}

async function updateImage(files: FileList, productId: number) {
  if (files && files.length > 0) {
    const form = new FormData()
    form.append('file', files[0])
    await $fetch(`${api.url}/images/${productId}`, {
      method: 'PUT',
      body: form,
    })
    refresh()
  }
}

async function selectImage() {
  document.getElementById('imgInput')?.click()
}

async function removeBarcode(barcodeId: number) {
  await $fetch(`${api.url}/barcodes/${barcodeId}`, { method: 'DELETE' })
  refresh()
}

function dateFormat(value: string) {
  if (value) {
    return new Date(value).toLocaleString('ar-eg', {
      dateStyle: 'short',
      timeStyle: 'short',
      hour12: false,
      numberingSystem: 'latn',
    })
  } else {
    return ''
  }
}
</script>

<template>
  <div v-if="data" class="space-y-4">
    <div class="flex justify-between me-10">
      <p class="text-2xl font-semibold">
        {{ `المنتجات: ${data.label}` }}
      </p>
      <NuxtLink to="/products">
        <UButton variant="link"> عودة </UButton>
      </NuxtLink>
    </div>
    <div id="prdCard">
      <div id="prdData">
        <p>رقم تعريفي:</p>
        <p>{{ data.id }}</p>
        <p>الاسم:</p>
        <p>{{ data.label }}</p>
        <p>سعر البيع:</p>
        <p>
          {{
            Number(data.price).toLocaleString('en-us', {
              minimumFractionDigits: 2,
            })
          }}
        </p>
        <p>الحالة:</p>
        <p :class="data.active ? 'text-current' : 'text-red-500'">
          {{ data.active ? 'مفعل' : 'غير مفعل' }}
        </p>
        <p>التصنيف:</p>
        <p>{{ data.category?.label }}</p>
        <p>الوحدة:</p>
        <p>{{ data.unit?.label }}</p>
        <p>تاريخ الإنشاء:</p>
        <p class="col-span-2">
          {{
            data.createdAt
              ? new Date(data.createdAt).toLocaleString('ar-eg', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                  hour12: false,
                  numberingSystem: 'latn',
                })
              : ''
          }}
        </p>
        <span />
        <span class="hidden min-[1200px]:col-span-2 min-[1200px]:block" />
        <p>باركود:</p>
        <div
          class="flex flex-row flex-wrap gap-2 max-w-[875px] col-span-3 min-[1200px]:col-span-5"
        >
          <UButtonGroup
            v-for="item in data.barcodes"
            :key="item.id"
            size="xs"
            orientation="horizontal"
            class="mx-2 bg-gray-200"
          >
            <span class="px-2 pt-1">{{ item.value }}</span>
            <UButton
              icon="i-heroicons-x-mark-16-solid"
              color="red"
              @click="removeBarcode(item.id)"
            />
          </UButtonGroup>
        </div>
      </div>
      <div>
        <img
          v-if="data.image"
          :src="`${api.url}/images/${data.image}`"
          alt="product image"
          width="250px"
          height="250px"
        >
        <div v-else class="w-[250px] h-[250px] prdLogo" />
      </div>
    </div>
    <div class="flex flex-row justify-around">
      <ProductsEdit
        :product="{
          id: data.id,
          label: data.label,
          price: data.price,
          active: data.active,
          categoryFK: data.categoryFK!,
          unitFK: data.unitFK!,
        }"
        :btn-label="`تعديل`"
        @close="refresh"
      />
      <ProductsBarcode
        :id="data.id"
        :label="data.label"
        :btn="`إضافة باركود`"
        @close="refresh"
      />
      <UButton
        icon="i-carbon-trash-can"
        :disabled="data.image ? false : true"
        @click="removeImage(data.id)"
      >
        ازالة الصورة
      </UButton>
      <UButton icon="i-carbon-image" @click="selectImage">
        تحديث الصورة
      </UButton>
    </div>

    <div>
      <p class="text-xl font-semibold">رصيد الكمية</p>
      <UTable :columns="stocksHeaders" :rows="stocks">
        <template #sum-data="{row}">
          {{ parseFloat(row.sum).toFixed(2) }}
        </template>
      </UTable>
    </div>

    <div v-if="moves">
      <p class="text-xl font-semibold">حركة المنتج</p>
      <UTable :columns="movesHeaders" :rows="moves.rows">
        <template #date-data="{ row }">
          {{ dateFormat(row.date) }}
        </template>
        <template #qty-data="{ row }">
          {{ parseFloat(row.qty).toFixed(2) }}
        </template>
        <template #price-data="{ row }">
          {{ parseFloat(row.price).toFixed(2) }}
        </template>
      </UTable>
      <div class="flex justify-center mt-auto">
        <UPagination
          v-model="page"
          :page-count="10"
          :total="moves.count.count"
          :max="5"
        />
      </div>
    </div>

    <UInput
      id="imgInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="updateImage($event, data.id)"
    />
  </div>
</template>

<style>
#prdCard {
  display: grid;
  grid-template-rows: max-content;
  grid-template-columns: 1fr 250px;
  max-width: 1050px;
}

#prdData {
  display: grid;
  grid-template-columns: repeat(2, 105px auto);
  row-gap: 8px;
  column-gap: 20px;
  align-items: center;
  max-width: 1000px;
}

#prdData > p:nth-child(even) {
  font-weight: 600;
}

@media screen and (min-width: 1200px) {
  #prdData {
    grid-template-columns: repeat(3, 105px auto);
  }
}

.prdLogo {
  background-color: currentColor;
  mask: url('/product.svg') no-repeat center / contain;
  width: 250px;
  height: 250px;
}
</style>
