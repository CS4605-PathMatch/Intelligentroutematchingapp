import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserType } from "../types";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserType;
  avatar: string;
  rating: number;
  totalTrips: number;
  verified: boolean;
  joinedDate: string;
  bikeType?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string, role: UserType) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserType, bikeType?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("pathMatch_user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("pathMatch_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("pathMatch_user");
    }
  }, [user]);

  const login = async (email: string, password: string, role: UserType) => {
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));

    const stored = localStorage.getItem(`pathMatch_account_${email}`);
    if (!stored) throw new Error("No account found with that email.");

    const account = JSON.parse(stored);
    if (account.password !== password) throw new Error("Incorrect password.");
    if (account.role !== role) throw new Error(`This account is registered as a ${account.role}, not a ${role}.`);

    const { password: _pw, ...authUser } = account;
    setUser(authUser);
  };

  const signup = async (name: string, email: string, password: string, role: UserType, bikeType?: string) => {
    await new Promise((r) => setTimeout(r, 800));

    const existing = localStorage.getItem(`pathMatch_account_${email}`);
    if (existing) throw new Error("An account with this email already exists.");

    const newUser: AuthUser & { password: string } = {
      id: `user_${Date.now()}`,
      name,
      email,
      password,
      role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      rating: 5.0,
      totalTrips: 0,
      verified: false,
      joinedDate: new Date().toISOString(),
      ...(role === "cyclist" && bikeType ? { bikeType } : {}),
    };

    localStorage.setItem(`pathMatch_account_${email}`, JSON.stringify(newUser));
    const { password: _pw, ...authUser } = newUser;
    setUser(authUser);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
