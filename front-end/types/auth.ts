// types/auth.ts
export type UserRole = 'user' | 'admin' | 'superadmin';

export type EmailVerificationResponse = {
  error?: string;
  message?: string;
  token?: string;
  verified?: boolean;
  has_user?: boolean;
};

export type VerifyCodeResponse = {
  error?: string;
  message?: string;
  verified?: boolean;
  email?: string;
  role?: UserRole;
};

export type RegistrationData = {
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  password: string;
  confirm_password: string;
};

export type RegistrationResponse = {
  error?: string;
  message?: string;
  email?: string;
  username?: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type LoginResponse = {
  error?: string;
  message?: string;
  token?: string;
  user?: {
    id: number;
    email: string;
    role: UserRole;
    last_login: string;
  };
};

export type AuthUser = {
  id: number;
  email: string;
  role: UserRole;
  last_login?: string;
};