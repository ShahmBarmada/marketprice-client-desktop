export default defineNuxtRouteMiddleware((to, from) => {
  if (from.path === "/") {
    if (localStorage.getItem("id") && localStorage.getItem("name")) {
      return navigateTo("/dashboard");
    }
  }
});
