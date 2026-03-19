import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  ArrowLeft,
  MapPin,
  Package,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Errand } from "../types";

export default function CustomerTrackDelivery() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [errand, setErrand] = useState<Errand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    const unsub = onSnapshot(doc(db, "errands", orderId), (snap) => {
      if (snap.exists()) {
        setErrand({ id: snap.id, ...snap.data() } as Errand);
      }
      setLoading(false);
    });
    return unsub;
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!errand) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-gray-600">Errand not found.</p>
        <Button onClick={() => navigate("/customer")}>Back to Dashboard</Button>
      </div>
    );
  }

  const isPending = errand.status === "pending";

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
          <h1 className="text-gray-900">Track Errand</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-4 max-w-2xl mx-auto">
        {/* Status card */}
        <Card className="p-6">
          {isPending ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="bg-green-100 rounded-full p-4">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
              </div>
              <div>
                <div className="text-lg text-gray-900 mb-1">Finding a cyclist...</div>
                <div className="text-sm text-gray-500">
                  We're matching your errand with a nearby cyclist. This usually takes just a few minutes.
                </div>
              </div>
              <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-blue-100 text-blue-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Cyclist Matched
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">✓</div>
                <div>
                  <div className="text-gray-900">Cyclist matched</div>
                  <div className="text-sm text-gray-600">On the way to pickup</div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Errand details */}
        <Card className="p-4">
          <h3 className="text-gray-900 mb-3">Errand Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Package className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
              <div>
                <div className="text-gray-500">Description</div>
                <div className="text-gray-900">{errand.description}</div>
              </div>
            </div>
            {errand.items?.length > 0 && (
              <div className="flex items-start gap-2">
                <Package className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
                <div>
                  <div className="text-gray-500">Items</div>
                  <div className="text-gray-900">{errand.items.join(", ")}</div>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
              <div>
                <div className="text-gray-500">Pickup</div>
                <div className="text-gray-900">{errand.pickupLocation.address}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
              <div>
                <div className="text-gray-500">Dropoff</div>
                <div className="text-gray-900">{errand.dropoffLocation.address}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
              <div>
                <div className="text-gray-500">Urgency</div>
                <div className="text-gray-900 capitalize">{errand.urgency}</div>
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
              <span>${errand.payment.toFixed(2)}</span>
            </div>
            {errand.tip > 0 && (
              <div className="flex items-center justify-between text-gray-600">
                <span>Tip</span>
                <span>${errand.tip.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-gray-900">
              <span>Total</span>
              <span className="text-lg">${(errand.payment + (errand.tip ?? 0)).toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Button variant="outline" className="w-full">
          Need Help?
        </Button>
      </div>
    </div>
  );
}
