<script lang="ts" setup>
const user = useUser()
const branch = useBranch()
const wh = useWH()

async function logout() {
  user.set(null)
  navigateTo('/')
}

const navLinks: { label: string; icon: string; to: string }[][] = []

switch (user.user.role) {
  case 'كاشير':
    navLinks.push([
      { label: 'نقطة بيع', icon: 'i-carbon-purchase', to: '/pos' },
      { label: 'فواتير معلقة', icon: 'i-carbon-purchase', to: '/pos/drafts' },
    ])
    break
  case 'مندوب بيع':
    navLinks.push([
      { label: 'مبيعات', icon: 'i-carbon-list-boxes', to: '/sales' },
      { label: 'عملاء', icon: 'i-carbon-identification', to: '/clients' },
    ])
    break
  case 'مسؤول مخزن':
    navLinks.push([
      { label: 'مشتريات', icon: 'i-carbon-list-boxes', to: '/purchase' },
      { label: 'مناقلات', icon: 'i-carbon-store', to: '/transactions' },
    ])
    break
  case 'إداري':
    navLinks.push(
      [
        { label: 'نقطة بيع', icon: 'i-carbon-purchase', to: '/pos' },
        { label: 'فواتير معلقة', icon: 'i-carbon-purchase', to: '/pos/drafts' },
      ],
      [
        { label: 'مبيعات', icon: 'i-carbon-list-boxes', to: '/sales' },
        { label: 'مشتريات', icon: 'i-carbon-list-boxes', to: '/purchase' },
        { label: 'مناقلات', icon: 'i-carbon-store', to: '/transactions' },
      ],
      [
        { label: 'منتجات', icon: 'i-carbon-product', to: '/products' },
        { label: 'عملاء', icon: 'i-carbon-identification', to: '/clients' },
        { label: 'موردين', icon: 'i-carbon-downstream', to: '/vendors' },
      ]
    )
    break
  case 'مدير':
    navLinks.push(
      [
        { label: 'نقطة بيع', icon: 'i-carbon-purchase', to: '/pos' },
        { label: 'فواتير معلقة', icon: 'i-carbon-purchase', to: '/pos/drafts' },
      ],
      [
        { label: 'مبيعات', icon: 'i-carbon-list-boxes', to: '/sales' },
        { label: 'مشتريات', icon: 'i-carbon-list-boxes', to: '/purchase' },
        { label: 'مناقلات', icon: 'i-carbon-store', to: '/transactions' },
      ],
      [
        { label: 'منتجات', icon: 'i-carbon-product', to: '/products' },
        { label: 'كميات', icon: 'i-carbon-product', to: '/stocks' },
        { label: 'عملاء', icon: 'i-carbon-identification', to: '/clients' },
        { label: 'موردين', icon: 'i-carbon-downstream', to: '/vendors' },
      ],
      [
        { label: 'مناطق خدمة', icon: 'i-carbon-location', to: '/areas' },
        { label: 'تصنيفات', icon: 'i-carbon-group-objects', to: '/categories' },
        { label: 'موظفين', icon: 'i-carbon-user-multiple', to: '/users' },
        { label: 'إعدادات', icon: 'i-carbon-settings', to: '/configs' },
      ]
    )
    break
}
</script>

<template>
  <div id="panel" class="h-full bg-gray-100 dark:bg-gray-900">
    <div
      id="nav"
      class="overflow-auto flex flex-col flex-nowrap gap-y-4 py-4 border-e border-e-solid border-e-gray-400 dark:border-e-gray-200"
    >
      <div class="flex flex-col flex-nowrap gap-y-2 px-4">
        <h2
          class="text-center text-primary dark:text-primary-600 font-bold text-2xl"
        >
          سعر السوق
        </h2>
        <div class="flex flex-row flex-nowrap justify-between items-center">
          <p class="font-semibold text-md">
            {{ user.user.name }}
          </p>
          <ColorModeToggle />
        </div>
        <p>{{ `${branch.branch.label} - ${wh.wh.label}` }}</p>
      </div>

      <UVerticalNavigation
        :links="navLinks"
        :ui="{
          size: 'text-md',
          label: 'ps-2',
          active:
            'text-white dark:text-white before:bg-primary dark:before:bg-primary-600',
          icon: {
            active: 'text-white',
            inactive: 'text-gray-500 dark:text-gray-400',
          },
        }"
        class="shrink-0 grow-0 px-2"
      />

      <div
        class="mt-auto px-2 flex flex-row flex-nowrap justify-between items-center"
      >
        <UButton variant="ghost" @click.prevent="logout"> خروج </UButton>
      </div>
    </div>

    <div id="content" class="p-4 overflow-auto">
      <slot />
    </div>
  </div>
</template>

<style>
#panel {
  display: grid;
  grid-template-columns: 280px 1fr;
  grid-template-rows: 1fr;
}

#nav {
  grid-column: 1 / 2;
}

#content {
  grid-column: 2/3;
  grid-row: 1/2;
}
</style>
