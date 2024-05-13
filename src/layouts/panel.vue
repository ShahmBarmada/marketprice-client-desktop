<script lang="ts" setup>
const links = [
  [
    { label: "كاشير", icon: "i-carbon-purchase", to: "/pos" },
    { label: "فواتير", icon: "i-carbon-receipt", to: "/" },
    { label: "صندوق", icon: "i-carbon-currency-pound", to: "/" },
  ],
  [
    { label: "اوردرات توصيل", icon: "i-carbon-scooter", to: "/" },
    { label: "حركة مخزن", icon: "i-carbon-store", to: "/" },
    { label: "عملاء", icon: "i-carbon-identification", to: "/" },
    { label: "حسابات", icon: "i-carbon-book", to: "/" },
    { label: "موردين", icon: "i-carbon-downstream", to: "/" },
    { label: "موظفين", icon: "i-carbon-user-data", to: "/" },
  ],
  [
    { label: "اوردر جديد", icon: "i-carbon-dot-mark", to: "/" },
    { label: "فاتورة جديدة", icon: "i-carbon-dot-mark", to: "/" },
    { label: "حركة جديدة", icon: "i-carbon-dot-mark", to: "/" },
  ]
];
</script>

<template>
  <div class="h-screen flex flex-row flex-nowrap bg-gray-100 dark:bg-gray-950">
    <div
      class="h-full flex flex-col flex-nowrap gap-y-4 py-4 border-e border-e-solid border-e-gray-400 dark:border-e-gray-200 ">
      <h2 class="text-center text-primary font-bold text-2xl grow-0 shrink-0">سعر السوق</h2>
      <UVerticalNavigation :links="links" :ui="{ size: 'text-md', label: 'ps-2' }" class="w-48 shrink-0 grow-0 py-4 px-2" />
      <div class="grow-0 shrink-0 mt-auto px-2 flex flex-row flex-nowrap justify-between">
        <UButton variant="ghost">خروج</UButton>
        <ColorModeToggle />
      </div>
    </div>
    <div class="grow p-4">
      <slot />
    </div>
  </div>
</template>

<style></style>
