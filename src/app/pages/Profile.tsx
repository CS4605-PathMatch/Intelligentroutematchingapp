import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft,
  Star,
  Shield,
  Award,
  Calendar,
  CreditCard,
} from "lucide-react";
import { useAuth, AuthUser } from "../context/AuthContext";
import { useCyclistStats } from "../hooks/useCyclistStats";

export default function Profile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user: authUser } = useAuth();

  const [profileUser, setProfileUser] = useState<AuthUser | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Determine if we're viewing our own profile
  const isOwnProfile = authUser?.id === userId;

  useEffect(() => {
    if (isOwnProfile && authUser) {
      setProfileUser(authUser);
      setLoadingProfile(false);
      return;
    }
    // Viewing someone else — fetch from Firestore
    if (!userId) return;
    getDoc(doc(db, "users", userId)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const profile = data.cyclist ?? data.customer ?? null;
        if (profile) {
          const role = data.cyclist ? "cyclist" : "customer";
          setProfileUser({ ...profile, role });
        }
      }
      setLoadingProfile(false);
    });
  }, [userId, isOwnProfile, authUser]);

  const { stats } = useCyclistStats(
    profileUser?.role === "cyclist" ? profileUser.id : undefined
  );

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">User not found.</div>
      </div>
    );
  }

  const verificationStatus = profileUser.idVerificationStatus;
  const verificationBadge =
    verificationStatus === "approved"
      ? { label: "Verified", classes: "bg-green-100 text-green-700" }
      : verificationStatus === "pending"
      ? { label: "Pending review", classes: "bg-yellow-100 text-yellow-700" }
      : verificationStatus === "rejected"
      ? { label: "Rejected", classes: "bg-red-100 text-red-700" }
      : { label: "Not submitted", classes: "bg-gray-100 text-gray-500" };

  // Dynamic achievements
  const achievements = [
    {
      emoji: "🚴",
      title: "Century Club",
      desc: "100+ deliveries",
      earned: profileUser.totalTrips >= 100,
      gradient: "from-blue-50 to-purple-50",
      border: "border-blue-200",
    },
    {
      emoji: "⭐",
      title: "Top Rated",
      desc: "4.8+ rating",
      earned: profileUser.rating >= 4.8,
      gradient: "from-yellow-50 to-orange-50",
      border: "border-yellow-200",
    },
    {
      emoji: "⚡",
      title: "Speed Demon",
      desc: "50+ deliveries",
      earned: profileUser.totalTrips >= 50,
      gradient: "from-green-50 to-emerald-50",
      border: "border-green-200",
    },
    {
      emoji: "🌱",
      title: "Eco Warrior",
      desc: "10+ deliveries",
      earned: profileUser.totalTrips >= 10,
      gradient: "from-pink-50 to-red-50",
      border: "border-pink-200",
    },
  ];

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
          <h1 className="text-gray-900">Profile</h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Profile header */}
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <img
              src={profileUser.avatar}
              alt={profileUser.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl text-gray-900">{profileUser.name}</h2>
                {profileUser.verified && (
                  <Shield className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-lg text-gray-900">{profileUser.rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{profileUser.totalTrips} deliveries</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Joined{" "}
                  {new Date(profileUser.joinedDate).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl text-gray-900">{profileUser.totalTrips}</div>
              <div className="text-xs text-gray-600">Total trips</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-gray-900">{stats.completedToday}</div>
              <div className="text-xs text-gray-600">Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-gray-900">{stats.totalRides}</div>
              <div className="text-xs text-gray-600">This month</div>
            </div>
          </div>
        </Card>

        {/* ID verification banner for own cyclist profile */}
        {isOwnProfile && profileUser.role === "cyclist" && verificationStatus !== "approved" && (
          <div className={`rounded-xl p-4 flex items-start gap-3 ${
            verificationStatus === "pending"
              ? "bg-yellow-50 border border-yellow-200"
              : verificationStatus === "rejected"
              ? "bg-red-50 border border-red-200"
              : "bg-blue-50 border border-blue-200"
          }`}>
            <CreditCard className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              verificationStatus === "pending" ? "text-yellow-600" :
              verificationStatus === "rejected" ? "text-red-600" : "text-blue-600"
            }`} />
            <div className="flex-1">
              <div className={`text-sm font-medium mb-1 ${
                verificationStatus === "pending" ? "text-yellow-800" :
                verificationStatus === "rejected" ? "text-red-800" : "text-blue-800"
              }`}>
                {verificationStatus === "pending"
                  ? "ID verification under review"
                  : verificationStatus === "rejected"
                  ? "ID verification rejected"
                  : "Verify your identity"}
              </div>
              <div className={`text-xs mb-3 ${
                verificationStatus === "pending" ? "text-yellow-700" :
                verificationStatus === "rejected" ? "text-red-700" : "text-blue-700"
              }`}>
                {verificationStatus === "pending"
                  ? "We're reviewing your documents. This usually takes 1–2 business days."
                  : verificationStatus === "rejected"
                  ? "Your submission was rejected. Please resubmit with clearer photos."
                  : "Submit your ID and a selfie to become a verified cyclist."}
              </div>
              {verificationStatus !== "pending" && (
                <Button
                  onClick={() => navigate("/cyclist/verify-id")}
                  size="sm"
                  className={
                    verificationStatus === "rejected"
                      ? "bg-red-600 hover:bg-red-700 h-8 text-xs"
                      : "bg-blue-600 hover:bg-blue-700 h-8 text-xs"
                  }
                >
                  {verificationStatus === "rejected" ? "Resubmit documents" : "Verify now"}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Verification & Safety */}
        <Card className="p-4">
          <h3 className="text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Verification & Safety
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  verificationStatus === "approved" ? "bg-green-100" :
                  verificationStatus === "pending" ? "bg-yellow-100" : "bg-gray-100"
                }`}>
                  <Shield className={`w-4 h-4 ${
                    verificationStatus === "approved" ? "text-green-600" :
                    verificationStatus === "pending" ? "text-yellow-600" : "text-gray-400"
                  }`} />
                </div>
                <span className="text-sm text-gray-900">Identity verification</span>
              </div>
              <Badge className={verificationBadge.classes}>{verificationBadge.label}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${profileUser.verified ? "bg-green-100" : "bg-gray-100"}`}>
                  <Shield className={`w-4 h-4 ${profileUser.verified ? "text-green-600" : "text-gray-400"}`} />
                </div>
                <span className="text-sm text-gray-900">Account verified</span>
              </div>
              <Badge className={profileUser.verified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
                {profileUser.verified ? "Verified" : "Unverified"}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Achievements */}
        {profileUser.role === "cyclist" && (
          <Card className="p-4">
            <h3 className="text-gray-900 mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              Achievements
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((a) => (
                <div
                  key={a.title}
                  className={`bg-gradient-to-br ${a.gradient} rounded-lg p-3 border ${a.border} ${
                    !a.earned ? "opacity-40 grayscale" : ""
                  }`}
                >
                  <div className="text-2xl mb-1">{a.emoji}</div>
                  <div className="text-sm text-gray-900">{a.title}</div>
                  <div className="text-xs text-gray-600">{a.desc}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Report button — only show when viewing someone else's profile */}
        {!isOwnProfile && (
          <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
            Report User
          </Button>
        )}
      </div>
    </div>
  );
}
