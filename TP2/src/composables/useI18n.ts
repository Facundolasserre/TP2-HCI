import { ref } from 'vue';
import { useLanguageStore } from '@/stores/language';
import en from '@/locales/en.json';
import es from '@/locales/es.json';

const translations = {
  en,
  es,
};

export function useI18n() {
  const languageStore = useLanguageStore();
  const lang = ref(languageStore.language);

  function t(key: string) {
    return translations[lang.value][key] || key;
  }

  return { t };
}
