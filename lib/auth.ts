import { jwtDecode } from "jwt-decode";
import { User } from "@/types";

export const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
  }
};

export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

export const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
  }
};

export const getUser = (): User | null => {
  const token = getToken();
  if (!token) return null;

  try {
    // Check if it's a base64 encoded token (local storage auth)
    try {
      const decoded = JSON.parse(atob(token));
      return {
        id: decoded.id || "",
        username: decoded.username,
        email: decoded.email,
      };
    } catch {
      // Not base64, try JWT (for backward compatibility)
      try {
        const decoded = jwtDecode<{ id?: string; userId?: string; username: string; email: string; role?: string }>(token);
        return {
          id: decoded.id || decoded.userId || "",
          username: decoded.username,
          email: decoded.email,
        };
      } catch {
        return null;
      }
    }
  } catch {
    return null;
  }
};

export const isAdmin = (): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    // Check if it's a base64 encoded token (local storage auth)
    try {
      const decoded = JSON.parse(atob(token));
      return decoded.role === "admin";
    } catch {
      // Not base64, try JWT (for backward compatibility)
      try {
        const decoded = jwtDecode<{ role?: string }>(token);
        return decoded.role === "admin";
      } catch {
        return false;
      }
    }
  } catch {
    return false;
  }
};

export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

