import { create } from "zustand";

interface AuthState {
  user: string | null;
  isAuthenticated: boolean;
  login: (user: string, token: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: (user, token) => {
    localStorage.setItem("user", user);
    localStorage.setItem("token", token);
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: () => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (user && token) {
      set({ user, isAuthenticated: true });
    } else {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
