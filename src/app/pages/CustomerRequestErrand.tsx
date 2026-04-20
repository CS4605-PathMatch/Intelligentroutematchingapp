import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  ArrowLeft,
  MapPin,
  Package,
  Clock,
  DollarSign,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import PlacesAutocomplete from "../components/PlacesAutocomplete";
import { Location } from "../types";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export default function CustomerRequestErrand() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [urgency, setUrgency] = useState<"flexible" | "soon" | "urgent">("soon");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);
  const [tip, setTip] = useState("");
  const [loading, setLoading] = useState(false);

  function haversineMi(a: Location, b: Location): number {
    const R = 3958.8;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((a.lat * Math.PI) / 180) *
        Math.cos((b.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  const BASE_RATE = 3;
  const RATE_PER_MI = 3;
  const URGENCY_SURCHARGE: Record<string, number> = { urgent: 5, soon: 2, flexible: 0 };

  const errandDistanceMi =
    pickupLocation && dropoffLocation
      ? Math.round(haversineMi(pickupLocation, dropoffLocation) * 10) / 10
      : null;
  const distancePrice =
    errandDistanceMi !== null
      ? Math.round(errandDistanceMi * RATE_PER_MI * 100) / 100
      : null;
  const urgencySurcharge = URGENCY_SURCHARGE[urgency] ?? 0;
  const estimatedPrice =
    distancePrice !== null
      ? Math.round((BASE_RATE + distancePrice + urgencySurcharge) * 100) / 100
      : null;

  const handleSubmit = async () => {
    if (!description || !pickupAddress || !dropoffAddress) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!pickupLocation || !dropoffLocation) {
      toast.error("Please select locations from the dropdown.");
      return;
    }
    if (!user) {
      toast.error("You must be logged in to request an errand.");
      return;
    }

    setLoading(true);
    try {
      const errandRef = await addDoc(collection(db, "errands"), {
        customerId: user.id,
        customerName: user.name,
        customerRating: user.rating,
        description,
        items: items ? items.split(",").map(i => i.trim()).filter(Boolean) : [],
        pickupLocation,
        dropoffLocation,
        urgency,
        payment: estimatedPrice ?? 0,
        tip: parseFloat(tip) || 0,
        status: "pending",
        requestedTime: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });

      toast.success("Errand requested! Finding nearby cyclists...");
      setTimeout(() => navigate(`/customer/track/${errandRef.id}`), 1500);
    } catch (err: any) {
      toast.error("Failed to submit request. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const urgencyOptions = [
    { value: "flexible", label: "Flexible", desc: "Within 2 hours", color: "bg-gray-100 text-gray-700 border-gray-300" },
    { value: "soon", label: "Soon", desc: "Within 30 min", color: "bg-orange-100 text-orange-700 border-orange-300" },
    { value: "urgent", label: "Urgent", desc: "ASAP", color: "bg-red-100 text-red-700 border-red-300" },
  ];

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
          <h1 className="text-gray-900">Request Errand</h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            We'll match you with cyclists already heading in your direction, making deliveries faster and more affordable.
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            What do you need? *
          </Label>
          <Input
            id="description"
            placeholder="e.g., Pick up prescription from CVS"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Items */}
        <div className="space-y-2">
          <Label htmlFor="items">Items to pick up (optional)</Label>
          <Textarea
            id="items"
            placeholder="List items separated by commas"
            value={items}
            onChange={(e) => setItems(e.target.value)}
            rows={3}
          />
        </div>

        {/* Pickup location */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-600" />
            Pickup location *
          </Label>
          <PlacesAutocomplete
            value={pickupAddress}
            onChange={(val) => { setPickupAddress(val); setPickupLocation(null); }}
            onPlaceSelect={(loc) => {
              setPickupLocation(loc);
              setPickupAddress(loc.address);
            }}
            placeholder="Search pickup address"
          />
        </div>

        {/* Dropoff location */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-600" />
            Dropoff location *
          </Label>
          <PlacesAutocomplete
            value={dropoffAddress}
            onChange={(val) => { setDropoffAddress(val); setDropoffLocation(null); }}
            onPlaceSelect={(loc) => {
              setDropoffLocation(loc);
              setDropoffAddress(loc.address);
            }}
            placeholder="Search dropoff address"
          />
        </div>

        {/* Urgency */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            When do you need this?
          </Label>
          <div className="grid grid-cols-3 gap-3">
            {urgencyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setUrgency(option.value as any)}
                className={`p-3 rounded-lg border-2 transition ${
                  urgency === option.value
                    ? option.color + " border-current"
                    : "bg-white border-gray-200 text-gray-600"
                }`}
              >
                <div className="text-sm">{option.label}</div>
                <div className="text-xs mt-1 opacity-75">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Price estimate */}
        <div className="bg-white rounded-xl p-4 border-2 border-green-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-900">Estimated price</span>
            <div className="flex items-center gap-1 text-2xl text-green-600">
              <DollarSign className="w-6 h-6" />
              <span>
                {estimatedPrice !== null
                  ? ((estimatedPrice) + (parseFloat(tip) || 0)).toFixed(2)
                  : "—"}
              </span>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            {estimatedPrice !== null ? (
              <>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Base rate</span>
                  <span>${BASE_RATE.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Distance ({errandDistanceMi} mi × $3/mi)</span>
                  <span>${distancePrice!.toFixed(2)}</span>
                </div>
                {urgencySurcharge > 0 && (
                  <div className="flex items-center justify-between text-gray-600">
                    <span>{urgency === "urgent" ? "Urgent" : "Soon"} surcharge</span>
                    <span>+${urgencySurcharge.toFixed(2)}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-400 italic">Select pickup and dropoff to see price</div>
            )}
            <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
              <span className="text-gray-600">Add tip (optional)</span>
              <Input
                type="number"
                placeholder="0.00"
                value={tip}
                onChange={(e) => setTip(e.target.value)}
                className="w-20 h-8 text-right"
                step="0.50"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
        >
          {loading ? "Submitting..." : "Request Errand"}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          You won't be charged until a cyclist accepts your request
        </p>
      </div>
    </div>
  );
}
