import http from './http';
import type {
  Credentials,
  RegistrationData,
  RegisteredUser,
  GetUser,
  UpdateUserProfile,
  AuthenticationToken,
  VerificationCode,
  PasswordChange,
  PasswordReset,
  NewUser,
} from '@/types/user';

class UsersService {
  async register(data: RegistrationData): Promise<RegisteredUser> {
    const response = await http.post<RegisteredUser>('/api/users/register', data);
    return response.data;
  }

  async login(credentials: Credentials): Promise<AuthenticationToken> {
    const response = await http.post<AuthenticationToken>('/api/users/login', credentials);
    return response.data;
  }

  async getProfile(): Promise<GetUser> {
    const response = await http.get<GetUser>('/api/users/profile');
    return response.data;
  }

  async updateProfile(data: UpdateUserProfile): Promise<GetUser> {
    const response = await http.put<GetUser>('/api/users/profile', data);
    return response.data;
  }

  async sendVerification(email: string): Promise<void> {
    await http.post(`/api/users/send-verification?email=${encodeURIComponent(email)}`);
  }

  async verifyAccount(payload: VerificationCode): Promise<NewUser> {
    const response = await http.post<NewUser>('/api/users/verify-account', payload);
    return response.data;
  }

  async changePassword(payload: PasswordChange): Promise<void> {
    await http.post('/api/users/change-password', payload);
  }

  async sendPasswordRecovery(email: string): Promise<void> {
    await http.post(`/api/users/forgot-password?email=${encodeURIComponent(email)}`);
  }

  async resetPassword(payload: PasswordReset): Promise<void> {
    await http.post('/api/users/reset-password', payload);
  }

  async logout(): Promise<void> {
    await http.post('/api/users/logout');
  }
}

export default new UsersService();

export type {
  Credentials,
  RegistrationData,
  RegisteredUser,
  GetUser,
  UpdateUserProfile,
  AuthenticationToken,
  VerificationCode,
  PasswordChange,
  PasswordReset,
  NewUser,
};
