import { computed } from 'vue';
import { useLanguageStore } from '@/stores/language';
import en from '@/locales/en.json';
import es from '@/locales/es.json';

const translations = {
  en,
  es,
};

export function useI18n() {
  const languageStore = useLanguageStore();
  const lang = computed<'en' | 'es'>(() =>
    (languageStore.language as 'en' | 'es') || 'es'
  );

  function t(
    key: string,
    params?: Record<string, string | number>
  ): string {
    const dictionary = translations[lang.value] || {};
    const template = dictionary[key] || key;

    if (!params) {
      return template;
    }

    return Object.entries(params).reduce((message, [paramKey, value]) => {
      const pattern = new RegExp(`{${paramKey}}`, 'g');
      return message.replace(pattern, String(value));
    }, template);
  }

  return { t };
}
