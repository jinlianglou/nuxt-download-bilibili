import { Icon } from "@vicons/utils";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('Icon', Icon);
});
