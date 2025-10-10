import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLanguageStore = defineStore('language', () => {
  const language = ref(localStorage.getItem('language') || 'es');

  function setLanguage(lang: string) {
    language.value = lang;
    localStorage.setItem('language', lang);
    // Reload the page to apply the new language
    location.reload();
  }

  return {
    language,
    setLanguage,
  };
});
