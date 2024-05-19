<script lang="ts" setup>
const serverStatus = ref(true);
const toast = useToast();

setInterval(async () => {
  try {
    await $fetch(localStorage.getItem("lsu") + "ping", { method: "GET" });
    serverStatus.value = true;
  } catch {
    serverStatus.value = false;
  }
}, 3000);

watch(serverStatus, () => {
  if (serverStatus.value) {
    toast.add({
      id: "connRestored",
      title: "تم الاتصال بالسيرفر",
      color: "green",
      timeout: 60000,
      ui: {
        background: "bg-green-500 dark:bg-green-500",
        title: "text-white",
        progress: { background: "bg-white" },
        default: { closeButton: { class: "text-white" } },
      },
    });
  } else {
    toast.add({
      id: "connFailed",
      title: "فشل الاتصال بالسيرفر",
      color: "red",
      timeout: 0,
      ui: {
        background: "bg-red-500 dark:bg-red-500",
        title: "text-white",
        progress: { background: "bg-white" },
        default: { closeButton: { class: "text-white" } },
      },
    });
  }
});
</script>

<template></template>
