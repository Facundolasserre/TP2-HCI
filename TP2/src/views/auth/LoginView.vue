<template>
  <div class="auth-wrapper">
    <section class="card">
      <div class="language-switcher">
        <button @click="toggleLanguage">
          <img src="@/assets/fonts/language.png" alt="Language" />
        </button>
      </div>
      <!-- Logo -->
      <div class="logo-wrap">
        <div class="logo-circle">
          <img src="@/assets/LogoHCI.png" alt="BagIt logo" class="logo-img" />
        </div>
      </div>

      <!-- Título -->
      <h1 class="title">{{ t('login.title') }}</h1>

      <!-- Form -->
      <form class="form" @submit.prevent="onSubmit">
        <input class="input" v-model="email" type="email" autocomplete="email" required :placeholder="t('login.email_placeholder')" />

        <input class="input" v-model="password" type="password" autocomplete="current-password" required :placeholder="t('login.password_placeholder')" />

        <!-- Error message -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="links-row">
          <a class="link" href="#" @click.prevent="onForgot">{{ t('login.forgot_password') }}</a>
        </div>

        <button class="btn" type="submit" :disabled="isLoading">
          {{ isLoading ? t('login.loading') : t('login.login_button') }}
        </button>

        <div class="signup-row">
          <span>{{ t('login.no_account') }}</span>
          <a class="link" href="#" @click.prevent="onSignUp">{{ t('login.signup') }}</a>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from '@/composables/useI18n';
import { useLanguageStore } from '@/stores/language';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);
const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();
const languageStore = useLanguageStore();

async function onSubmit() {
  if (!email.value.trim() || !password.value) {
    errorMessage.value = t('login.error_fill_fields');
    return;
  }

  errorMessage.value = '';
  isLoading.value = true;

  try {
    await authStore.login({
      email: email.value.trim(),
      password: password.value,
    });

    router.push('/Home');
  } catch (err: any) {
    let message = err.response?.data?.message || err.message || t('login.error_credentials');
    if (message === 'Invalid credentials') {
      message = t('login.error_credentials');
    }
    errorMessage.value = message;
    if (message.toLowerCase().includes('verified') || message.toLowerCase().includes('verificado')) {
      router.push({ name: 'verify-account', query: { email: email.value } });
    }
  } finally {
    isLoading.value = false;
  }
}

function onForgot() {
  router.push('/forgot-password');
}

function onSignUp() {
  router.push('/register');
}

function toggleLanguage() {
  const newLang = languageStore.language === 'es' ? 'en' : 'es';
  languageStore.setLanguage(newLang);
}
</script>

<style scoped>
.auth-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #1C1C30;
}

.card {
  position: relative;
  width: 460px;
  background: #322D59;
  color: #EDEAF6;
  border-radius: 20px;
  padding: 40px 48px 28px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}

.language-switcher {
  position: absolute;
  top: 20px;
  right: 20px;
}

.language-switcher button {
  background: transparent;
  border: none;
  cursor: pointer;
}

.language-switcher img {
  width: 24px;
  height: 24px;
}

.logo-wrap { display: flex; justify-content: center; margin-top: -56px; margin-bottom: 6px; }

.logo-img { width: 200px; height: auto; object-fit: contain; }

.title {
  text-align: center;
  font-size: 40px;
  font-weight: 800;
  margin: 10px 0 24px;
}

.form { display: flex; flex-direction: column; gap: 20px; }

.input::placeholder {
  color: rgba(237, 234, 246, 0.5);
}

.input {
  background: transparent;
  color: #EDEAF6;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.35);
  height: 36px;
  outline: none;
  padding-left: 0;
}

.input:focus { border-bottom-color: #fff; }

.error-message {
  color: #ff6b6b;
  font-size: 14px;
  padding: 10px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
  text-align: center;
  margin-top: -10px;
}

.links-row { 
  display: flex; 
  justify-content: flex-end;
  text-decoration: underline;
}

.link { color: #DAD4FF; font-size: 14px; cursor: pointer; }

.btn {
  margin: 12px auto 10px;
  width: 304px;
  height: 40px;
  border-radius: 999px;
  border: none;
  background: #FFFFFF;
  color: #000;
  font-weight: 800;
  font-size: 18px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:hover:not(:disabled) {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.signup-row {
  display: flex;
  gap: 6px;
  justify-content: flex-start;
  color: #CFC9E6;
  font-size: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  padding-top: 14px;
  margin-top: 10px;
}

.signup-row a {
  color: #CFC9E6;
  text-decoration: underline;
  font-weight: 600;
}

.signup-row a:hover {
  color: #ffffff;
}
</style>
