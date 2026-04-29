import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import authService, { LoginData, RegisterData } from "@/services/authService";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  affiliation: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const getUserFromToken = (): AuthUser | null => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) return null;

    const decoded = jwtDecode<{
      sub: string;
      email: string;
      role: string;
      exp: number;
    }>(token);

    if (decoded.exp * 1000 < Date.now()) {
      Cookies.remove("accessToken");
      return null;
    }

    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      name: "",
      affiliation: "",
    };
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: getUserFromToken(),
  isAuthenticated: !!getUserFromToken(),
  isLoading: false,
  error: null,
  successMessage: null,
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      return await authService.register(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed",
      );
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data: LoginData, { rejectWithValue }) => {
    try {
      return await authService.login(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error: any) {
      return rejectWithValue("Logout failed");
    }
  },
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getMe();
    } catch (error: any) {
      return rejectWithValue("Failed to fetch user");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })

      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        if (state.user) state.user = { ...state.user, ...action.payload };
      });
  },
});

export const { clearError, clearSuccessMessage, updateUser } =
  authSlice.actions;
export default authSlice.reducer;
