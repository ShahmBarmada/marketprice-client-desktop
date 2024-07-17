<script lang="ts" setup>
// const appConfig = useAppConfig()

useHead({
  htmlAttrs: { lang: 'ar', dir: 'rtl' },
})
</script>

<template>
  <NuxtLoadingIndicator />
  <NuxtLayout>
    <NuxtPage />
    <UNotifications />
  </NuxtLayout>
</template>

<style>
#__nuxt {
  height: 100%;
}
</style>
