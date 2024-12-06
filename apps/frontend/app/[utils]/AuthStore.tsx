import { create } from "zustand";

interface AuthState {
  user: string | null;
  id: string | null;
  isAuthenticated: boolean;
  login: (user: string, token: string, id: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  id: null,
  isAuthenticated: false,

  login: (user, token, id) => {
    localStorage.setItem("user", user);
    localStorage.setItem("token", token);
    localStorage.setItem("userId", id);
    set({ user, id, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: () => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("id");
    if (user && token) {
      set({ user, isAuthenticated: true });
    } else {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
