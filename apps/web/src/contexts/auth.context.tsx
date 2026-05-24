"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  role: string;
  subscription?: {
    status: string;
    plan: string;
    trialEnd?: string;
  } | null;
}

interface AuthContextType {
  user: User | null;
  tenants: Tenant[];
  currentTenant: Tenant | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setCurrentTenant: (tenant: Tenant) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const savedTenant = localStorage.getItem("currentTenant");

    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      if (savedTenant) {
        const tenant = JSON.parse(savedTenant);
        setCurrentTenant(tenant);
        api.defaults.headers.common["x-tenant-slug"] = tenant.slug;
      }
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data.user);
      const userTenants = data.user.tenantMembers?.map((m: { tenant: Tenant; role: string }) => ({
        ...m.tenant,
        role: m.role,
      })) || [];
      setTenants(userTenants);
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    
    localStorage.setItem("accessToken", data.tokens.accessToken);
    localStorage.setItem("refreshToken", data.tokens.refreshToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${data.tokens.accessToken}`;

    setUser(data.user);
    setTenants(data.tenants);

    // Auto-select first tenant
    if (data.tenants.length > 0) {
      const tenant = data.tenants[0];
      setCurrentTenant(tenant);
      localStorage.setItem("currentTenant", JSON.stringify(tenant));
      api.defaults.headers.common["x-tenant-slug"] = tenant.slug;
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentTenant");
    delete api.defaults.headers.common["Authorization"];
    delete api.defaults.headers.common["x-tenant-slug"];
    setUser(null);
    setTenants([]);
    setCurrentTenant(null);
  };

  const handleSetCurrentTenant = (tenant: Tenant) => {
    setCurrentTenant(tenant);
    localStorage.setItem("currentTenant", JSON.stringify(tenant));
    api.defaults.headers.common["x-tenant-slug"] = tenant.slug;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenants,
        currentTenant,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        setCurrentTenant: handleSetCurrentTenant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
