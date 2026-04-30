import api from "./api";
import Cookies from "js-cookie";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  affiliation?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    affiliation: string;
  };
  accessToken: string;
  refreshToken: string;
}

const authService = {
  register: async (data: RegisterData) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  verifyOtp: async (email: string, otp: string) => {
    const response = await api.post("/auth/verify-otp", { email, otp });
    return response.data;
  },

  resendOtp: async (email: string) => {
    const response = await api.post("/auth/resend-otp", { email });
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", data);

    Cookies.set("accessToken", response.data.accessToken, {
      expires: 1 / 96,
      sameSite: "strict",
    });
    Cookies.set("refreshToken", response.data.refreshToken, {
      expires: 7,
      sameSite: "strict",
    });

    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  verifyResetOtp: async (email: string, otp: string) => {
    const response = await api.post("/auth/verify-reset-otp", { email, otp });
    return response.data;
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    const response = await api.post("/auth/reset-password", {
      email,
      otp,
      newPassword,
    });
    return response.data;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
    }
  },

  getMe: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },
};

export default authService;
