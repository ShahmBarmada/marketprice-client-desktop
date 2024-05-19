<script lang="ts" setup>
const user = useUserData();

async function logout() {
  localStorage.removeItem("id");
  localStorage.removeItem("name");
  localStorage.removeItem("role");
  localStorage.removeItem("perms");
  navigateTo("/");
}

const navLinks = [[{ label: "الرئيسية", icon: "i-carbon-collapse-all", to: "/dashboard" }]];

switch (user.value.role) {
  case "كاشير":
    navLinks.push([
      { label: "كاشير", icon: "i-carbon-purchase", to: "/pos-entry" },
      { label: "اوردرات", icon: "i-carbon-list-boxes", to: "/pos-oprs" },
    ]);
    break;
  case "مندوب بيع":
    navLinks.push([
      { label: "اوردر جديد", icon: "i-carbon-new-tab", to: "/sales-entry" },
      { label: "اوردرات", icon: "i-carbon-list-boxes", to: "/sales-oprs" },
      { label: "عملاء", icon: "i-carbon-identification", to: "/sales-clients" },
      { label: "منتجات", icon: "i-carbon-product", to: "/sales-products" },
    ]);
    break;
  case "مسؤول مخزن":
    navLinks.push([
      { label: "حركة جديدة", icon: "i-carbon-new-tab", to: "/inv-entry" },
      { label: "حركة مخزن", icon: "i-carbon-movement", to: "/inv-oprs" },
      { label: "رصيد مخزن", icon: "i-carbon-store", to: "/inv-products" },
    ]);
    break;
  case "إداري":
    navLinks.push([
      { label: "فواتير", icon: "i-carbon-receipt", to: "/adm-invoices" },
      { label: "حسابات", icon: "i-carbon-catalog", to: "/adm-accounts" },
      { label: "موردين", icon: "i-carbon-downstream", to: "/adm-vendors" },
      { label: "موظفين", icon: "i-carbon-user-data", to: "/adm-employees" },
      { label: "مناطق خدمة", icon: "i-carbon-location", to: "/adm-areas" },
    ]);
    break;
  case "مدير":
    navLinks.push([{ label: "مستخدمين", icon: "i-carbon-user-multiple", to: "/mgr-users" }]);
    break;
  case "su":
    navLinks.push([
      { label: "كاشير", icon: "i-carbon-purchase", to: "/pos-entry" },
      { label: "اوردرات", icon: "i-carbon-list-boxes", to: "/pos-oprs" },
      { label: "اوردر جديد", icon: "i-carbon-new-tab", to: "/sales-entry" },
      { label: "اوردرات", icon: "i-carbon-list-boxes", to: "/sales-oprs" },
      { label: "عملاء", icon: "i-carbon-identification", to: "/sales-clients" },
      { label: "منتجات", icon: "i-carbon-product", to: "/sales-products" },
      { label: "حركة جديدة", icon: "i-carbon-new-tab", to: "/inv-entry" },
      { label: "حركة مخزن", icon: "i-carbon-movement", to: "/inv-oprs" },
      { label: "رصيد مخزن", icon: "i-carbon-store", to: "/inv-products" },
      { label: "فواتير", icon: "i-carbon-receipt", to: "/adm-invoices" },
      { label: "حسابات", icon: "i-carbon-catalog", to: "/adm-accounts" },
      { label: "موردين", icon: "i-carbon-downstream", to: "/adm-vendors" },
      { label: "موظفين", icon: "i-carbon-user-data", to: "/adm-employees" },
      { label: "مناطق خدمة", icon: "i-carbon-location", to: "/adm-areas" },
      { label: "مستخدمين", icon: "i-carbon-user-multiple", to: "/mgr-users" },
    ]);
    break;
}
</script>

<template>
  <div id="panel" class="h-full bg-gray-100 dark:bg-gray-900">
    <div
      id="nav"
      class="overflow-auto flex flex-col flex-nowrap gap-y-4 py-4 border-e border-e-solid border-e-gray-400 dark:border-e-gray-200"
    >
      <div class="flex flex-col flex-nowrap gap-y-2 px-4">
        <h2 class="text-center text-primary dark:text-primary-600 font-bold text-2xl">سعر السوق</h2>
        <div class="flex flex-row flex-nowrap justify-between items-center">
          <p class="font-bold text-md">{{ user.name }}</p>
          <ColorModeToggle />
        </div>
      </div>

      <UVerticalNavigation
        :links="navLinks"
        :ui="{
          size: 'text-md',
          label: 'ps-2',
          active: 'text-white dark:text-white before:bg-primary dark:before:bg-primary-600',
          icon: { active: 'text-white', inactive: 'text-gray-500 dark:text-gray-400' },
        }"
        class="shrink-0 grow-0 px-2"
      />

      <div class="mt-auto px-2 flex flex-row flex-nowrap justify-between items-center">
        <UButton variant="ghost" @click.prevent="logout">خروج</UButton>
      </div>
    </div>

    <div id="content" class="p-4 overflow-auto">
      <slot />
    </div>
    <ServerConnAlert />
  </div>
</template>

<style>
#panel {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: 1fr;
}

#nave {
  grid-column: 1 / 2;
}

#content {
  grid-column: 2/3;
  grid-row: 1/2;
}
</style>
