export default defineNuxtRouteMiddleware((to, from) => {
  const config = useRuntimeConfig();
  const token = useCookie(config.public.tokenKey);

  if (!token.value) {
    return navigateTo("/");
  }
});
