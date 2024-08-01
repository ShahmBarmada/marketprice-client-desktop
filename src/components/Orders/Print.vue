<script setup lang="ts">
function printDialog() {
  window.print()
}
</script>
<template>
  <div>
    <UButton label="طباعة" @click="printDialog"/>
  </div>
</template>