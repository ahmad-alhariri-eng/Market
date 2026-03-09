// services/auth.service.ts
import { api } from "@/lib/api";
import {
  EmailVerificationResponse,
  VerifyCodeResponse,
  RegistrationData,
  RegistrationResponse,
  LoginData,
  LoginResponse,
  UserRole,
} from "@/types/auth";

export const authService = {
  async sendVerificationEmail(
    email: string,
    role: UserRole,
    locale: string
  ): Promise<EmailVerificationResponse> {
    try {
      const response = await api.post(
        "/auth/register/request-code/",
        { email, role },
        {
          headers: { "Accept-Language": locale },
        }
      );
      return response.data;
    } catch (error: any) {
      // The API interceptor already unwraps error.response.data,
      // so 'error' here IS the server response data directly
      if (error?.error) {
        return error;
      }
      if (error?.response?.data) {
        return error.response.data;
      }
      return {
        error: "Failed to send verification email",
        verified: false,
        has_user: false,
      };
    }
  },
  async verifyCode(code: string, token: string): Promise<VerifyCodeResponse> {
    try {
      const response = await api.post(
        "/auth/register/verify-code/",
        { code },
        {
          headers: { "X-Email-Token": token },
        }
      );
      console.log(response);
      return response.data;
    } catch (error: any) {
      console.log(error);
      // Return the server's exact error response
      if (error.error) {
        return error.error;
      }
      return {
        error: "Failed to verify code",
        verified: false,
      };
    }
  },

  async resendVerificationCode(
    email: string,
    token: string
  ): Promise<EmailVerificationResponse> {
    try {
      const response = await api.post(
        "/auth/register/resend-code/",
        { email },
        {
          headers: { "X-Email-Token": token },
        }
      );
      return response.data;
    } catch (error: any) {
      // Return the server's exact error response
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        error: "Failed to resend verification code",
        verified: false,
        has_user: false,
      };
    }
  },

  async completeRegistration(
    data: RegistrationData,
    token: string
  ): Promise<RegistrationResponse> {
    try {
      // Client-side password validation
      if (data.password !== data.confirm_password) {
        return { error: "كلمة المرور وتأكيدها غير متطابقين." };
      }

      const response = await api.post("/auth/register/", data, {
        headers: { "X-Email-Token": token },
      });
      return response.data;
    } catch (error: any) {
      // Return the exact error message from server
      if (error.response?.data?.error) {
        return { error: error.response.data.error };
      }
      return { error: "Failed to complete registration" };
    }
  },

  async login(data: LoginData): Promise<LoginResponse> {
    try {
      const response = await api.post("/auth/login/", data);
      return response.data;
    } catch (error: any) {
      return error.response?.data || { error: "Failed to login" };
    }
  },

  async requestPasswordReset(
    email: string,
    locale: string
  ): Promise<{
    error?: string;
    message?: string;
    token?: string;
  }> {
    try {
      const response = await api.post(
        "/auth/password/reset/request/",
        { email },
        {
          headers: { "Accept-Language": locale },
        }
      );
      console.log(response);
      return response.data;
    } catch (error: any) {
      console.log("Error requesting password reset:", error);
      // Handle unwrapped error object from interceptor
      if (error?.error || error?.detail || error?.message) {
        return error;
      }
      // Handle standard Axios error if interceptor didn't catch it
      if (error?.response?.data) {
        return error.response.data;
      }
      return { error: "Failed to request reset code" };
    }
  },

  async verifyResetCode(
    code: string,
    token: string
  ): Promise<{
    error?: string;
    message?: string;
    detail?: string;
  }> {
    try {
      const response = await api.post(
        "/auth/password/reset/verify/",
        { code },
        {
          headers: { "X-Email-Token": token },
        }
      );
      console.log(response);
      return response.data;
    } catch (error: any) {
      console.log(error);
      if (error?.error || error?.detail || error?.message) {
        return error;
      }
      return error.response?.data || { error: "Failed to verify reset code" };
    }
  },

  async resetPassword(
    newPassword: string,
    confirmPassword: string,
    token: string
  ): Promise<{
    error?: string;
    message?: string;
    detail?: string;
  }> {
    try {
      const response = await api.post(
        "/auth/password/reset/confirm/",
        {
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
        {
          headers: { "X-Email-Token": token },
        }
      );
      console.log(response);
      return response.data;
    } catch (error: any) {
      console.log(error);
      if (error?.error || error?.detail || error?.message) {
        return error;
      }
      return error.response?.data || { error: "Failed to reset password" };
    }
  },
  async logout(token: string): Promise<{ error?: string; message?: string }> {
    try {
      const response = await api.post(
        "/auth/logout/",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Email-Token": token,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return error.response?.data || { error: "Failed to logout" };
    }
  },
};
