import { createContext, useContext, useEffect, useState } from "react";
import { getMyProfile, loginUser } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    const token = localStorage.getItem("animesync_token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await getMyProfile();
      setUser(data.user);
    } catch {
      localStorage.removeItem("animesync_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function login(credentials) {
    const data = await loginUser(credentials);

    if (data.token) {
      localStorage.setItem("animesync_token", data.token);
    }

    setUser(data.user);
    return data;
  }

  function logout() {
    localStorage.removeItem("animesync_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        logout,
        refreshUser: loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
