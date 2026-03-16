import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { 
  Bike, 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  Menu,
  User,
  Settings,
  LogOut,
  Star
} from "lucide-react";
import { mockCyclist, mockCyclistStats } from "../data/mockData";

export default function CyclistDashboard() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img 
              src={mockCyclist.avatar} 
              alt={mockCyclist.name}
              className="w-12 h-12 rounded-full border-2 border-white"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">Hello, {mockCyclist.name.split(' ')[0]}</span>
                {mockCyclist.verified && (
                  <Badge className="bg-white text-blue-600 text-xs">Verified</Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-blue-100">
                <Star className="w-3 h-3 fill-white" />
                <span>{mockCyclist.rating}</span>
                <span className="mx-1">•</span>
                <span>{mockCyclist.totalTrips} trips</span>
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
            <div className="text-2xl">${mockCyclistStats.todayEarnings}</div>
            <div className="text-xs text-blue-100">Today</div>
          </Card>
          <Card className="bg-white/10 backdrop-blur border-white/20 p-3 text-center">
            <div className="text-2xl">${mockCyclistStats.weekEarnings}</div>
            <div className="text-xs text-blue-100">This Week</div>
          </Card>
          <Card className="bg-white/10 backdrop-blur border-white/20 p-3 text-center">
            <div className="text-2xl">{mockCyclistStats.completedToday}</div>
            <div className="text-xs text-blue-100">Completed</div>
          </Card>
        </div>
      </div>

      {/* Menu Dropdown */}
      {showMenu && (
        <div className="absolute top-20 right-6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-10">
          <button 
            onClick={() => navigate(`/profile/${mockCyclist.id}`)}
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
            onClick={() => navigate("/")}
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
              <span className="text-xl text-gray-900">${mockCyclistStats.monthEarnings}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Average per trip</span>
              <span className="text-green-600">${(mockCyclistStats.monthEarnings / mockCyclist.totalTrips).toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Active errands</span>
                <Badge className="bg-blue-100 text-blue-700">
                  {mockCyclistStats.activeErrands}
                </Badge>
              </div>
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
    </div>
  );
}