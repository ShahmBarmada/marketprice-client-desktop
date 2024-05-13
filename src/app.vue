<script lang="ts" setup>

const appConfig = useAppConfig()

useHead({
  htmlAttrs:{lang: 'ar', dir: 'rtl'}
})

</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
