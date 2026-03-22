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
  Star,
  Shield,
  DollarSign,
} from "lucide-react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Errand } from "../types";
import { toast } from "sonner";

export default function CustomerTrackDelivery() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [errand, setErrand] = useState<Errand | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    const unsub = onSnapshot(doc(db, "errands", orderId), (snap) => {
      if (snap.exists()) setErrand({ id: snap.id, ...snap.data() } as Errand);
      setLoading(false);
    });
    return unsub;
  }, [orderId]);

  const handleMarkDelivered = async () => {
    if (!orderId || !errand) return;
    setCompleting(true);
    try {
      await updateDoc(doc(db, "errands", orderId), {
        status: "completed",
        completedAt: new Date().toISOString(),
      });
      toast.success("Delivery confirmed! Payment released to cyclist.");
    } catch (err) {
      toast.error("Failed to confirm delivery.");
    } finally {
      setCompleting(false);
    }
  };

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
  const isMatched = errand.status === "matched";
  const isCompleted = errand.status === "completed";

  const paymentTotal = errand.payment + (errand.tip ?? 0);

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
          {isPending && (
            <div className="flex flex-col items-center text-center gap-4 py-2">
              <div className="bg-yellow-100 rounded-full p-4">
                <Loader2 className="w-8 h-8 text-yellow-600 animate-spin" />
              </div>
              <div>
                <div className="text-lg text-gray-900 mb-1">Finding a cyclist...</div>
                <div className="text-sm text-gray-500">We're matching your errand with a nearby cyclist.</div>
              </div>
              <Badge className="bg-yellow-100 text-yellow-700">Pending · Payment held</Badge>
            </div>
          )}

          {isMatched && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-100 text-blue-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Cyclist matched
                </Badge>
                <Badge className="bg-orange-100 text-orange-700">Payment held</Badge>
              </div>

              {/* Progress steps */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm">✓</div>
                  <div>
                    <div className="text-gray-900">Cyclist matched</div>
                    <div className="text-sm text-gray-500">On the way to pickup</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm">2</div>
                  <div className="text-gray-500">Delivered to you</div>
                </div>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="flex flex-col items-center text-center gap-3 py-2">
              <div className="bg-green-100 rounded-full p-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <div className="text-lg text-gray-900 mb-1">Delivered!</div>
                <div className="text-sm text-gray-500">Payment of ${paymentTotal.toFixed(2)} released to cyclist.</div>
              </div>
              <Badge className="bg-green-100 text-green-700">Completed · Payment released</Badge>
            </div>
          )}
        </Card>

        {/* Cyclist info — shown when matched or completed */}
        {(isMatched || isCompleted) && (errand as any).cyclistName && (
          <Card className="p-4">
            <h3 className="text-gray-900 mb-3">Your Cyclist</h3>
            <div className="flex items-center gap-3">
              <img
                src={(errand as any).cyclistAvatar}
                alt={(errand as any).cyclistName}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-gray-900">{(errand as any).cyclistName}</span>
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span>{(errand as any).cyclistRating}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

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
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-green-600" />
            <h3 className="text-gray-900">Payment</h3>
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
              isCompleted ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
            }`}>
              {isCompleted ? "Released" : "Held"}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Delivery fee</span>
              <span>${errand.payment.toFixed(2)}</span>
            </div>
            {(errand.tip ?? 0) > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Tip</span>
                <span>${errand.tip!.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-200 flex justify-between text-gray-900">
              <span>Total</span>
              <span className="text-lg">${paymentTotal.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Mark delivered — only shown when matched */}
        {isMatched && (
          <Button
            onClick={handleMarkDelivered}
            disabled={completing}
            className="w-full bg-green-600 hover:bg-green-700 h-12 text-base"
          >
            {completing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            {completing ? "Confirming..." : "Confirm Delivery & Release Payment"}
          </Button>
        )}

        {isCompleted && (
          <Button
            onClick={() => navigate("/customer")}
            className="w-full h-12"
            variant="outline"
          >
            Back to Dashboard
          </Button>
        )}

        {!isCompleted && (
          <Button variant="outline" className="w-full">Need Help?</Button>
        )}
      </div>
    </div>
  );
}
