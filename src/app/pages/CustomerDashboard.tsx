import { useState, useEffect } from "react";
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
  CheckCircle,
  ClipboardList
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Errand } from "../types";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [orders, setOrders] = useState<Errand[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "errands"), where("customerId", "==", user.id));
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Errand));
      setOrders(data.sort((a, b) => ((b as any).createdAt ?? "").localeCompare((a as any).createdAt ?? "")));
    });
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-white bg-white/20 flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">Hello, {user?.name?.split(' ')[0]}</span>
                {user?.verified && (
                  <Badge className="bg-white text-green-600 text-xs">Verified</Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-green-100">
                <Star className="w-3 h-3 fill-white" />
                <span>{user?.rating}</span>
                <span className="mx-1">•</span>
                <span>{orders.filter(o => o.status === "completed").length} orders</span>
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
            onClick={() => logout().then(() => navigate("/"))}
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
        {orders.filter(o => o.status === "pending" || o.status === "matched" || o.status === "in-progress").length > 0 && (
          <div>
            <h2 className="text-gray-900 mb-3">Active Orders</h2>
            <div className="space-y-3">
              {orders.filter(o => o.status === "pending" || o.status === "matched" || o.status === "in-progress").map(order => (
                <Card
                  key={order.id}
                  className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200 cursor-pointer"
                  onClick={() => navigate(`/customer/track/${order.id}`)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-gray-900">{order.description}</span>
                    <Badge className={
                      order.status === "in-progress" ? "bg-green-100 text-green-700" :
                      order.status === "matched" ? "bg-blue-100 text-blue-700" :
                      "bg-yellow-100 text-yellow-700"
                    }>
                      {order.status === "in-progress" ? "En Route" :
                       order.status === "matched" ? "Matched" : "Pending"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">${(order.payment + (order.tip ?? 0)).toFixed(2)}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent orders */}
        <div>
          <h2 className="text-gray-900 mb-3">Order History</h2>
          {orders.filter(o => o.status === "completed").length === 0 ? (
            <Card className="p-4 text-center text-gray-500 text-sm">No completed orders yet.</Card>
          ) : (
            <div className="space-y-3">
              {orders.filter(o => o.status === "completed").map(order => (
                <Card key={order.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-900">{(order as any).cyclistName ?? "Cyclist"}</span>
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{order.description}</p>
                    </div>
                    <span className="text-gray-900">${(order.payment + (order.tip ?? 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date((order as any).createdAt).toLocaleDateString()}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* All orders link */}
        <button
          onClick={() => navigate("/customer/orders")}
          className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:opacity-75 transition"
        >
          <span className="flex items-center gap-2 text-gray-700">
            <ClipboardList className="w-5 h-5 text-green-600" />
            View all orders
          </span>
          <span className="text-gray-400 text-sm">→</span>
        </button>

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
              <span className="text-gray-600">Per mile</span>
              <span className="text-gray-900">$3.00</span>
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