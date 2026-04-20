import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Ride {
  id: string;
  earnings: number;
  tip: number;
  completedAt: string; // ISO string
  description: string;
  from: string;
  to: string;
  status: string;
}

/** Firestore may return Timestamp; string compares need ISO strings */
function toCompletedAtIso(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate?: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return "";
}

export interface CyclistStats {
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  completedToday: number;
  totalRides: number;
}

function startOf(unit: "day" | "week" | "month"): Date {
  const now = new Date();
  if (unit === "day") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (unit === "week") {
    const day = now.getDay(); // 0 = Sunday
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
  }
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function useCyclistStats(userId: string | undefined) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const ridesRef = collection(db, "users", userId, "rides");
    const q = query(ridesRef, orderBy("completedAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map((d) => {
          const raw = d.data() as Record<string, unknown>;
          const r = { id: d.id, ...raw } as Ride;
          return {
            ...r,
            completedAt: toCompletedAtIso(raw.completedAt),
            status: typeof raw.status === "string" ? raw.status : "completed",
          };
        })
        .filter((r) => String(r.status).toLowerCase() === "completed");
      setRides(data);
      setLoading(false);
    });

    return unsub;
  }, [userId]);

  const dayStart = startOf("day").toISOString();
  const weekStart = startOf("week").toISOString();
  const monthStart = startOf("month").toISOString();

  const stats: CyclistStats = rides.reduce(
    (acc, ride) => {
      const total = ride.earnings + (ride.tip ?? 0);
      acc.totalRides += 1;
      const at = ride.completedAt;
      if (at && at >= dayStart) {
        acc.todayEarnings += total;
        acc.completedToday += 1;
      }
      if (at && at >= weekStart) acc.weekEarnings += total;
      if (at && at >= monthStart) acc.monthEarnings += total;
      return acc;
    },
    { todayEarnings: 0, weekEarnings: 0, monthEarnings: 0, completedToday: 0, totalRides: 0 }
  );

  stats.totalRides = rides.length;

  // Round to 2 decimal places
  stats.todayEarnings = Math.round(stats.todayEarnings * 100) / 100;
  stats.weekEarnings = Math.round(stats.weekEarnings * 100) / 100;
  stats.monthEarnings = Math.round(stats.monthEarnings * 100) / 100;

  return { stats, rides, loading };
}
