"use client";
import { useEffect } from "react";
import { useAuthStore } from "./AuthStore";

const AuthInitializer = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return null;
};

export default AuthInitializer;
