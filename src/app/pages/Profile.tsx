import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  ArrowLeft,
  Star,
  Shield,
  Award,
  TrendingUp,
  Calendar,
  Bike,
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { useCyclistStats } from "../hooks/useCyclistStats";
import { AuthUser } from "../context/AuthContext";

interface ProfileData extends Omit<AuthUser, "role"> {
  role: "cyclist" | "customer";
}

export default function Profile() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Always call the hook — only use results if it's a cyclist
  const { stats, rides } = useCyclistStats(
    profile?.role === "cyclist" ? profile.id : undefined
  );

  useEffect(() => {
    if (!userId) return;
    getDoc(doc(db, "users", userId)).then((snap) => {
      if (!snap.exists()) {
        setLoading(false);
        return;
      }
      const data = snap.data();
      // If viewing own profile, show current role; otherwise prefer cyclist
      let roleData: ProfileData | null = null;
      if (currentUser?.id === userId) {
        const roleProfile = data[currentUser.role];
        if (roleProfile) roleData = { ...roleProfile, role: currentUser.role };
      } else {
        if (data.cyclist) roleData = { ...data.cyclist, role: "cyclist" };
        else if (data.customer) roleData = { ...data.customer, role: "customer" };
      }
      setProfile(roleData);
      setLoading(false);
    });
  }, [userId, currentUser]);

  const isCyclist = profile?.role === "cyclist";
  const isOwnProfile = currentUser?.id === userId;

  // Dynamically compute achievements for cyclists
  const achievements = isCyclist
    ? [
        stats.totalRides >= 100 && {
          emoji: "🚴",
          title: "Century Club",
          desc: "100+ deliveries",
          color: "from-blue-50 to-purple-50 border-blue-200",
        },
        (profile?.rating ?? 0) >= 4.8 && {
          emoji: "⭐",
          title: "Top Rated",
          desc: "4.8+ rating",
          color: "from-yellow-50 to-orange-50 border-yellow-200",
        },
        stats.totalRides >= 10 && {
          emoji: "⚡",
          title: "Getting Started",
          desc: "10+ deliveries",
          color: "from-green-50 to-emerald-50 border-green-200",
        },
        stats.totalRides >= 50 && {
          emoji: "🌱",
          title: "Eco Warrior",
          desc: "50+ eco deliveries",
          color: "from-pink-50 to-red-50 border-pink-200",
        },
      ].filter(Boolean)
    : [];

  // Mock rating breakdown derived from real rating
  const rating = profile?.rating ?? 5;
  const totalTrips = profile?.totalTrips ?? 0;
  const ratingBreakdown = [
    { stars: 5, count: Math.round(totalTrips * 0.77), percentage: 77 },
    { stars: 4, count: Math.round(totalTrips * 0.17), percentage: 17 },
    { stars: 3, count: Math.round(totalTrips * 0.04), percentage: 4 },
    { stars: 2, count: Math.round(totalTrips * 0.02), percentage: 2 },
    { stars: 1, count: 0, percentage: 0 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">User not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-gray-900">{isOwnProfile ? "My Profile" : "Profile"}</h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Profile header */}
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-20 h-20 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl text-gray-900">{profile.name}</h2>
                {profile.verified && <Shield className="w-5 h-5 text-blue-600" />}
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-lg text-gray-900">{rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  {isCyclist ? stats.totalRides : totalTrips}{" "}
                  {isCyclist ? "deliveries" : "orders"}
                </span>
              </div>
              {isCyclist && profile.bikeType && (
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                  <Bike className="w-3 h-3" />
                  <span>{profile.bikeType}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>
                  Joined{" "}
                  {new Date(profile.joinedDate).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {isCyclist && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="text-2xl text-gray-900">
                  ${stats.monthEarnings.toFixed(0)}
                </div>
                <div className="text-xs text-gray-500">This month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl text-gray-900">{stats.totalRides}</div>
                <div className="text-xs text-gray-500">Total trips</div>
              </div>
              <div className="text-center">
                <div className="text-2xl text-gray-900">{rating.toFixed(1)}</div>
                <div className="text-xs text-gray-500">Rating</div>
              </div>
            </div>
          )}
        </Card>

        {/* Verification */}
        <Card className="p-4">
          <h3 className="text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Verification & Safety
          </h3>
          <div className="space-y-2">
            {[
              { label: "Identity verified", done: profile.verified },
              { label: "Phone number", done: true },
              { label: "Email address", done: true },
            ].map(({ label, done }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      done ? "bg-green-100" : "bg-gray-100"
                    }`}
                  >
                    <Shield
                      className={`w-4 h-4 ${done ? "text-green-600" : "text-gray-400"}`}
                    />
                  </div>
                  <span className="text-sm text-gray-900">{label}</span>
                </div>
                <Badge
                  className={
                    done
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }
                >
                  {done ? "Verified" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Achievements — cyclists only */}
        {isCyclist && achievements.length > 0 && (
          <Card className="p-4">
            <h3 className="text-gray-900 mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              Achievements
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {(achievements as { emoji: string; title: string; desc: string; color: string }[]).map((a) => (
                <div
                  key={a.title}
                  className={`bg-gradient-to-br ${a.color} rounded-lg p-3 border`}
                >
                  <div className="text-2xl mb-1">{a.emoji}</div>
                  <div className="text-sm text-gray-900">{a.title}</div>
                  <div className="text-xs text-gray-600">{a.desc}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Earnings breakdown — own cyclist profile only */}
        {isCyclist && isOwnProfile && (
          <Card className="p-4">
            <h3 className="text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Earnings
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Today</span>
                <span className="text-gray-900">${stats.todayEarnings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>This week</span>
                <span className="text-gray-900">${stats.weekEarnings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>This month</span>
                <span className="text-gray-900">${stats.monthEarnings.toFixed(2)}</span>
              </div>
              {rides.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-2">Recent trips</div>
                  {rides.slice(0, 3).map((ride) => (
                    <div key={ride.id} className="flex justify-between text-xs text-gray-600 py-1">
                      <span className="truncate flex-1 mr-2">{ride.description}</span>
                      <span className="text-green-600 flex-shrink-0">
                        +${(ride.earnings + (ride.tip ?? 0)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Rating breakdown */}
        {totalTrips > 0 && (
          <Card className="p-4">
            <h3 className="text-gray-900 mb-3">Rating Breakdown</h3>
            <div className="space-y-2">
              {ratingBreakdown.map((item) => (
                <div key={item.stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12 text-sm text-gray-600">
                    <span>{item.stars}</span>
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  </div>
                  <Progress value={item.percentage} className="flex-1" />
                  <span className="text-sm text-gray-500 w-8">{item.count}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Report button — only when viewing another user */}
        {!isOwnProfile && (
          <button className="w-full py-3 text-sm text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition">
            Report User
          </button>
        )}
      </div>
    </div>
  );
}
