import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import MapView from "../components/MapView";
import { 
  ArrowLeft,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Package,
  Star,
  Shield,
  CheckCircle
} from "lucide-react";
import { mockCyclist, mockLocations } from "../data/mockData";

export default function CustomerTrackDelivery() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [deliveryStatus, setDeliveryStatus] = useState<"matched" | "picked-up" | "in-transit" | "nearby" | "delivered">("in-transit");
  const [estimatedArrival, setEstimatedArrival] = useState(12);

  useEffect(() => {
    // Simulate delivery progress
    const timer = setTimeout(() => {
      if (deliveryStatus === "in-transit") {
        setDeliveryStatus("nearby");
        setEstimatedArrival(3);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [deliveryStatus]);

  const statusConfig = {
    matched: { label: "Matched", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
    "picked-up": { label: "Picked Up", color: "bg-orange-100 text-orange-700", icon: Package },
    "in-transit": { label: "In Transit", color: "bg-purple-100 text-purple-700", icon: MapPin },
    nearby: { label: "Nearby", color: "bg-green-100 text-green-700", icon: MapPin },
    delivered: { label: "Delivered", color: "bg-green-100 text-green-700", icon: CheckCircle },
  };

  const currentStatus = statusConfig[deliveryStatus];

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate("/customer")}
            className="flex items-center gap-2 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-gray-900">Track Delivery</h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Live map */}
      <div className="p-4">
        <MapView 
          startLocation={mockLocations.eastside}
          currentLocation={mockLocations.midtown}
          endLocation={mockLocations.parkside}
          className="h-80"
        />
      </div>

      <div className="px-4 pb-6 space-y-4">
        {/* Status card */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Badge className={currentStatus.color}>
              <currentStatus.icon className="w-3 h-3 mr-1" />
              {currentStatus.label}
            </Badge>
            <div className="text-right">
              <div className="text-sm text-gray-600">ETA</div>
              <div className="text-xl text-gray-900">{estimatedArrival} min</div>
            </div>
          </div>

          {/* Progress steps */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                deliveryStatus !== "matched" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {deliveryStatus !== "matched" ? "✓" : "1"}
              </div>
              <div className="flex-1">
                <div className="text-gray-900">Cyclist matched</div>
                <div className="text-sm text-gray-600">Alex is on the way to pickup</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                ["in-transit", "nearby", "delivered"].includes(deliveryStatus) ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {["in-transit", "nearby", "delivered"].includes(deliveryStatus) ? "✓" : "2"}
              </div>
              <div className="flex-1">
                <div className="text-gray-900">Item picked up</div>
                <div className="text-sm text-gray-600">Heading to your location</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                deliveryStatus === "delivered" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                3
              </div>
              <div className="flex-1">
                <div className="text-gray-900">Delivered</div>
                <div className="text-sm text-gray-600">At your doorstep</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Cyclist info */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src={mockCyclist.avatar}
              alt={mockCyclist.name}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-gray-900">{mockCyclist.name}</span>
                {mockCyclist.verified && (
                  <Shield className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span>{mockCyclist.rating}</span>
                <span className="mx-1">•</span>
                <span>{mockCyclist.totalTrips} deliveries</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
            <Button variant="outline" className="flex-1">
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
          </div>
        </Card>

        {/* Delivery details */}
        <Card className="p-4">
          <h3 className="text-gray-900 mb-3">Delivery Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-gray-600">Pickup</div>
                <div className="text-gray-900">{mockLocations.eastside.address}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-gray-600">Dropoff</div>
                <div className="text-gray-900">{mockLocations.parkside.address}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Package className="w-4 h-4 mt-0.5 text-gray-600 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-gray-600">Items</div>
                <div className="text-gray-900">Prescription medication, Receipt required</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment summary */}
        <Card className="p-4 bg-gray-50">
          <h3 className="text-gray-900 mb-3">Payment Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-gray-600">
              <span>Delivery fee</span>
              <span>$8.50</span>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <span>Tip</span>
              <span>$2.00</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-gray-900">
              <span>Total</span>
              <span className="text-lg">$10.50</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2 text-sm text-gray-600">
            <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
            <span>•••• 4242</span>
          </div>
        </Card>

        {/* Safety notice */}
        {deliveryStatus === "nearby" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-green-900 mb-1">Cyclist is nearby!</div>
            <div className="text-sm text-green-700">
              Please be ready to receive your delivery. You'll be asked to confirm receipt in the app.
            </div>
          </div>
        )}

        {/* Support button */}
        <Button variant="outline" className="w-full">
          Need Help?
        </Button>
      </div>
    </div>
  );
}