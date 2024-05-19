<script lang="ts" setup>
const user  = useUserData()
definePageMeta({
  layout: "panel",
});

function conLog() {
  let value = localStorage.getItem("perms");
  if (value) {
    console.log(typeof value);
    console.log(JSON.parse(value));
  }
}
</script>

<template>
  <div>
    <!-- <p>{{ user.id }}</p>
    <p>{{ user.name }}</p>
    <p>{{ user.role }}</p>
    <UButton @click="conLog" label="log" /> -->
  </div>
</template>
