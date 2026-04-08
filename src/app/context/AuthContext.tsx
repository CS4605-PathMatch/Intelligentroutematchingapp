import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { UserType } from "../types";

export interface AuthUser {
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

// Shape stored in Firestore at users/{uid}
interface UserDocument {
  cyclist?: Omit<AuthUser, "role">;
  customer?: Omit<AuthUser, "role">;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, role: UserType) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserType, bikeType?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider mounting", {
      authConfig: {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      },
    });

    const timer = setTimeout(() => {
      console.warn("AuthProvider timeout: onAuthStateChanged did not fire in 8s, forcing loading=false");
      setLoading(false);
    }, 8000);

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timer);
      console.log("onAuthStateChanged fired", firebaseUser);

      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          if (snap.exists()) {
            const data = snap.data() as UserDocument;
            const activeRole = sessionStorage.getItem("activeRole") as UserType | null;
            const profile = activeRole && data[activeRole]
              ? { ...data[activeRole]!, role: activeRole }
              : data.cyclist
              ? { ...data.cyclist, role: "cyclist" as UserType }
              : data.customer
              ? { ...data.customer, role: "customer" as UserType }
              : null;
            setUser(profile);
          } else {
            setUser(null);
            console.warn("User doc not found, user is null");
          }
        } catch (err: any) {
          console.error("Failed to load user profile from Firestore", err);
          setUser(null); // allow login UI when Firestore is temporarily unavailable
        }
      } else {
        setUser(null);
        sessionStorage.removeItem("activeRole");
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, []);

  const login = async (email: string, password: string, role: UserType) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);

    const snap = await getDoc(doc(db, "users", credential.user.uid));
    if (!snap.exists()) throw new Error("Account not found.");

    const data = snap.data() as UserDocument;
    const roleProfile = data[role];
    if (!roleProfile) throw new Error(`No ${role} account found for this email.`);

    sessionStorage.setItem("activeRole", role);
    setUser({ ...roleProfile, role });
  };

  const signup = async (name: string, email: string, password: string, role: UserType, bikeType?: string) => {
    let uid: string;

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      uid = credential.user.uid;
      await updateProfile(credential.user, { displayName: name });
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        // Email exists — sign in to get the UID and add the new role
        const credential = await signInWithEmailAndPassword(auth, email, password);
        uid = credential.user.uid;

        // Check this role doesn't already exist
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          const data = snap.data() as UserDocument;
          if (data[role]) throw new Error(`A ${role} account already exists for this email.`);
        }
      } else {
        throw err;
      }
    }

    const profile: Omit<AuthUser, "role"> = {
      id: uid,
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      rating: 5.0,
      totalTrips: 0,
      verified: false,
      joinedDate: new Date().toISOString(),
      ...(role === "cyclist" && bikeType ? { bikeType } : {}),
    };

    // Merge so the other role's data is preserved
    await setDoc(doc(db, "users", uid), { [role]: profile }, { merge: true });

    sessionStorage.setItem("activeRole", role);
    setUser({ ...profile, role });
  };

  const logout = async () => {
    await signOut(auth);
    sessionStorage.removeItem("activeRole");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
