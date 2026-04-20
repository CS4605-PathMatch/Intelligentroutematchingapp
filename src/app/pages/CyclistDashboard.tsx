import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Bike,
  TrendingUp,
  Menu,
  User,
  Settings,
  LogOut,
  Star,
  ClipboardList,
  MapPin,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCyclistStats } from "../hooks/useCyclistStats";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function CyclistDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { stats, rides } = useCyclistStats(user?.id);
  const [showMenu, setShowMenu] = useState(false);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "errands"),
      where("cyclistId", "==", user.id),
      where("status", "in", ["matched", "in-progress"])
    );
    return onSnapshot(q, (snap) => setActiveCount(snap.size));
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-white bg-white/20 flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">Hello, {user?.name?.split(' ')[0]}</span>
                {user?.verified && (
                  <Badge className="bg-white text-blue-600 text-xs">Verified</Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-blue-100">
                <Star className="w-3 h-3 fill-white" />
                <span>{user?.rating}</span>
                <span className="mx-1">•</span>
                <span>{rides.length} trips</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-white/10 backdrop-blur border-white/20 p-3 text-center">
            <div className="text-2xl">${stats.todayEarnings.toFixed(2)}</div>
            <div className="text-xs text-blue-100">Today</div>
          </Card>
          <Card className="bg-white/10 backdrop-blur border-white/20 p-3 text-center">
            <div className="text-2xl">${stats.weekEarnings.toFixed(2)}</div>
            <div className="text-xs text-blue-100">This Week</div>
          </Card>
          <Card className="bg-white/10 backdrop-blur border-white/20 p-3 text-center">
            <div className="text-2xl">{stats.completedToday}</div>
            <div className="text-xs text-blue-100">Completed</div>
          </Card>
        </div>
      </div>

      {/* Menu Dropdown */}
      {showMenu && (
        <div className="absolute top-20 right-6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-10">
          <button
            onClick={() => navigate(`/profile/${user?.id}`)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
          >
            <User className="w-5 h-5 text-gray-600" />
            <span>Profile</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
            <Settings className="w-5 h-5 text-gray-600" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => { logout().then(() => navigate("/")); }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-red-600"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="p-6 space-y-6">
        {/* Start route button */}
        <Button 
          onClick={() => navigate("/cyclist/route")}
          className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 h-14 text-lg"
        >
          <Bike className="w-6 h-6 mr-2" />
          Start a Route
        </Button>

        {/* Earnings overview */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Earnings Overview</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">This Month</span>
              <span className="text-xl text-gray-900">${stats.monthEarnings.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Average per trip</span>
              <span className="text-green-600">${(stats.totalRides > 0 ? (stats.monthEarnings / stats.totalRides).toFixed(2) : "0.00")}</span>
            </div>
          </div>
        </Card>

        {/* How it works */}
        <Card className="p-4 bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
          <h3 className="text-gray-900 mb-3">How PathMatch Works</h3>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">1</div>
              <div>
                <div className="text-gray-900">Set your route</div>
                <div className="text-gray-600">Tell us where you're cycling</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">2</div>
              <div>
                <div className="text-gray-900">See matched errands</div>
                <div className="text-gray-600">Review nearby requests with minimal detour</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">3</div>
              <div>
                <div className="text-gray-900">Accept & earn</div>
                <div className="text-gray-600">Get paid for trips you're already taking</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Safety features */}
        <Card className="p-4">
          <h3 className="text-gray-900 mb-3">Safety & Support</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-green-600">✓</span>
              <span>All customers are identity verified</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-green-600">✓</span>
              <span>In-app emergency contact button</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-green-600">✓</span>
              <span>Real-time GPS tracking for safety</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-green-600">✓</span>
              <span>24/7 support team available</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-20">
        <button
          onClick={() => navigate("/cyclist")}
          className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-blue-600"
        >
          <Bike className="w-5 h-5" />
          <span className="text-xs">Home</span>
        </button>
        <button
          onClick={() => navigate("/cyclist/route")}
          className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-gray-400 hover:text-blue-600 transition"
        >
          <MapPin className="w-5 h-5" />
          <span className="text-xs">Route</span>
        </button>
        <button
          onClick={() => navigate("/cyclist/errands")}
          className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-gray-400 hover:text-blue-600 transition relative"
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-xs">Errands</span>
          {activeCount > 0 && (
            <span className="absolute top-2 right-6 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
        <button
          onClick={() => navigate(`/profile/${user?.id}`)}
          className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-gray-400 hover:text-blue-600 transition"
        >
          <User className="w-5 h-5" />
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </div>
  );
}