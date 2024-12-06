import { IconConfigProvider } from "@vicons/utils";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('IconConfigProvider', IconConfigProvider);
});
