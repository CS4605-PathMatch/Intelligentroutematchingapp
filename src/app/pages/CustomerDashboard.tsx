import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { 
  Package,
  Plus,
  Menu,
  User,
  Settings,
  LogOut,
  Star,
  Clock,
  CheckCircle
} from "lucide-react";
import { mockCustomer, mockCustomerOrders } from "../data/mockData";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img 
              src={mockCustomer.avatar} 
              alt={mockCustomer.name}
              className="w-12 h-12 rounded-full border-2 border-white"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">Hello, {mockCustomer.name.split(' ')[0]}</span>
                {mockCustomer.verified && (
                  <Badge className="bg-white text-green-600 text-xs">Verified</Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-green-100">
                <Star className="w-3 h-3 fill-white" />
                <span>{mockCustomer.rating}</span>
                <span className="mx-1">•</span>
                <span>{mockCustomer.totalTrips} orders</span>
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

        {/* Quick action */}
        <Button 
          onClick={() => navigate("/customer/request")}
          className="w-full bg-white text-green-600 hover:bg-green-50 h-14 text-lg"
        >
          <Plus className="w-6 h-6 mr-2" />
          Request an Errand
        </Button>
      </div>

      {/* Menu Dropdown */}
      {showMenu && (
        <div className="absolute top-20 right-6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-10">
          <button 
            onClick={() => navigate(`/profile/${mockCustomer.id}`)}
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
        {/* Active orders */}
        <div>
          <h2 className="text-gray-900 mb-3">Active Orders</h2>
          <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <div className="flex items-center gap-3">
              <Package className="w-12 h-12 text-green-600" />
              <div className="flex-1">
                <p className="text-gray-900">No active deliveries</p>
                <p className="text-sm text-gray-600">Request an errand to get started</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent orders */}
        <div>
          <h2 className="text-gray-900 mb-3">Recent Orders</h2>
          <div className="space-y-3">
            {mockCustomerOrders.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-900">{order.cyclistName}</span>
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{order.description}</p>
                  </div>
                  <span className="text-gray-900">${order.amount.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{order.date}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* How it works */}
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-green-50 border-blue-200">
          <h3 className="text-gray-900 mb-3">How PathMatch Works</h3>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">1</div>
              <div>
                <div className="text-gray-900">Request your errand</div>
                <div className="text-gray-600">Describe what you need picked up or delivered</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">2</div>
              <div>
                <div className="text-gray-900">Get matched with a cyclist</div>
                <div className="text-gray-600">We find cyclists already heading your way</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">3</div>
              <div>
                <div className="text-gray-900">Track & receive</div>
                <div className="text-gray-600">Real-time tracking until delivery</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Pricing info */}
        <Card className="p-4">
          <h3 className="text-gray-900 mb-3">Transparent Pricing</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Base delivery fee</span>
              <span className="text-gray-900">$5.00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Per kilometer</span>
              <span className="text-gray-900">$1.50</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Service fee</span>
              <span className="text-gray-900">10%</span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between text-green-600">
                <span>Average savings vs. traditional delivery</span>
                <span>30-40%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Safety features */}
        <Card className="p-4">
          <h3 className="text-gray-900 mb-3">Safe & Secure</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-green-600">✓</span>
              <span>All cyclists are identity verified</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-green-600">✓</span>
              <span>Real-time GPS tracking</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-green-600">✓</span>
              <span>Secure in-app payments</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-green-600">✓</span>
              <span>Rate your experience</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}