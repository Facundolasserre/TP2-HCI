<template>
  <div class="auth-wrapper">
    <section class="card">
      <!-- Logo -->
      <div class="logo-wrap">
        <img src="@/assets/LogoHCI.png" alt="BagIt logo" class="logo-img" />
      </div>

      <!-- Título -->
      <h1 class="title">{{ t('verify.title') }}</h1>
      <p class="subtitle">{{ t('verify.subtitle') }} {{ email }}</p>

      <!-- Form -->
      <form class="form" @submit.prevent="onSubmit">
        <label class="label">{{ t('verify.code_label') }}</label>
        <input
          class="input"
          v-model.trim="code"
          type="text"
          :placeholder="t('verify.code_placeholder')"
          maxlength="16"
          required
        />

        <!-- Error message -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- Success message -->
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <button class="btn" type="submit" :disabled="!code || isLoading">
          {{ isLoading ? t('verify.verifying') : t('verify.verify_button') }}
        </button>

        <div class="links-row">
          <a class="link" href="#" @click.prevent="resendCode">{{ t('verify.resend_code') }}</a>
          <span class="separator">|</span>
          <a class="link" href="#" @click.prevent="goToLogin">{{ t('verify.back_to_login') }}</a>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from '@/composables/useI18n';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { t } = useI18n();

const code = ref('');
const email = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);

onMounted(() => {
  email.value = (route.query.email as string) || '';
  if (authStore.verificationToken) {
    code.value = authStore.verificationToken;
  }
});

async function onSubmit() {
  if (!code.value.trim()) {
    errorMessage.value = t('verify.error_enter_code');
    return;
  }

  errorMessage.value = '';
  successMessage.value = '';
  isLoading.value = true;

  try {
    await authStore.verifyAccount(code.value.trim());
    successMessage.value = t('verify.success_message');
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || err.message || t('verify.error_invalid_code');
  } finally {
    isLoading.value = false;
  }
}

async function resendCode() {
  if (!email.value) {
    errorMessage.value = t('verify.error_no_email');
    return;
  }

  errorMessage.value = '';
  successMessage.value = '';
  isLoading.value = true;

  try {
    await authStore.sendVerification(email.value);
    successMessage.value = t('verify.resend_success');
  } catch (err: any) {
    console.error('Error resending code:', err);
    errorMessage.value = err.response?.data?.message || err.message || t('verify.error_resend');
  } finally {
    isLoading.value = false;
  }
}

function goToLogin() {
  router.push('/login');
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
  width: 460px;
  background: #322D59;
  color: #EDEAF6;
  border-radius: 20px;
  padding: 40px 48px 28px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}

.logo-wrap {
  display: flex;
  justify-content: center;
  margin-top: -56px;
  margin-bottom: 6px;
}

.logo-img {
  width: 200px;
  height: auto;
  object-fit: contain;
}

.title {
  text-align: center;
  font-size: 40px;
  font-weight: 800;
  margin: 10px 0 12px;
}

.subtitle {
  text-align: center;
  color: #CFC9E6;
  font-size: 14px;
  margin: 0 0 24px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.label {
  font-size: 14px;
  color: #CFC9E6;
  text-align: left;
  margin-left: 0;
}

.input {
  background: transparent;
  color: #EDEAF6;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.35);
  height: 36px;
  outline: none;
  padding-left: 0;
  font-family: monospace;
  font-size: 16px;
  letter-spacing: 1px;
}

.input:focus {
  border-bottom-color: #fff;
}

.error-message {
  color: #ff6b6b;
  font-size: 14px;
  padding: 10px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
  text-align: center;
  margin-top: -10px;
}

.success-message {
  color: #51cf66;
  font-size: 14px;
  padding: 10px;
  background: rgba(81, 207, 102, 0.1);
  border-radius: 8px;
  text-align: center;
  margin-top: -10px;
}

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

.links-row {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  padding-top: 14px;
  margin-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
}

.link {
  color: #DAD4FF;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
}

.link:hover {
  color: #fff;
}

.separator {
  color: #CFC9E6;
  opacity: 0.5;
}
</style>