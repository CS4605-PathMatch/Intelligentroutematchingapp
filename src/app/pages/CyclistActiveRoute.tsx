import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import MapView from "../components/MapView";
import ErrandCard from "../components/ErrandCard";
import PlacesAutocomplete from "../components/PlacesAutocomplete";
import {
  ArrowLeft,
  Navigation,
  Play,
  Filter,
  AlertCircle,
  PackageCheck,
  X,
  RotateCcw,
  ArrowRightLeft,
  CheckCircle,
  Clock,
  CalendarClock,
} from "lucide-react";
import { toast } from "sonner";
import { Errand, Location } from "../types";
import { collection, addDoc, updateDoc, doc, query, where, onSnapshot, increment } from "firebase/firestore";

import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

function haversineKm(a: Location, b: Location): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

type RouteMode = "point-to-point" | "round-trip";

export default function CyclistActiveRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [errands, setErrands] = useState<Errand[]>([]);
  const [routeStarted, setRouteStarted] = useState(false);
  const [queuedErrands, setQueuedErrands] = useState<Errand[]>([]);
  const [filterUrgency, setFilterUrgency] = useState<string>("all");
  const [routeMode, setRouteMode] = useState<RouteMode>("point-to-point");
  const [roundTripKm, setRoundTripKm] = useState(10);
  const [maxDetourKm, setMaxDetourKm] = useState(2);
  const [departureMode, setDepartureMode] = useState<"now" | "scheduled">("now");
  const [scheduledTime, setScheduledTime] = useState<string>(() => {
    const now = new Date();
    now.setSeconds(0, 0);
    return now.toISOString().slice(0, 16);
  });
  const [rideCompleted, setRideCompleted] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "errands"), where("status", "==", "pending"));
    const unsub = onSnapshot(q, (snap) => {
      setErrands(
        snap.docs.map((d) => ({
          id: d.id,
          deviation: 0,
          matchScore: 50,
          ...d.data(),
        } as Errand))
      );
    });
    return unsub;
  }, []);
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);

  const handleAcceptErrand = async (errandId: string) => {
    const errand = errands.find(e => e.id === errandId);
    if (!errand) return;

    const confirmationCode = String(Math.floor(1000 + Math.random() * 9000));
    const errandWithCode = { ...errand, confirmationCode };

    // Store full errand object now — it will disappear from pending list after Firestore update
    setQueuedErrands(prev => [...prev, errandWithCode]);

    if (user) {
      try {
        await updateDoc(doc(db, "errands", errandId), {
          status: "matched",
          cyclistId: user.id,
          cyclistName: user.name,
          cyclistAvatar: user.avatar,
          cyclistRating: user.rating,
          confirmationCode,
          acceptedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Failed to accept errand:", err);
        toast.error("Failed to accept errand.");
        setQueuedErrands(prev => prev.filter(e => e.id !== errandId));
        return;
      }
    }

    const total = errand.payment + (errand.tip ?? 0);
    toast.success(`Errand accepted! +$${total.toFixed(2)}`);
  };

  const queuedIds = new Set(queuedErrands.map(e => e.id));

  const departureTime = departureMode === "now" ? new Date() : new Date(scheduledTime);

  const urgencyWindowMinutes: Record<string, number> = {
    urgent: 30,
    soon: 60,
    flexible: 240,
  };

  const scoreErrand = (e: Errand): Pick<Errand, "deviation" | "matchScore"> => {
    if (routeMode === "round-trip") {
      if (!startLocation) return { deviation: 0, matchScore: 50 };
      const detour =
        haversineKm(startLocation, e.pickupLocation) +
        haversineKm(e.pickupLocation, e.dropoffLocation) +
        haversineKm(e.dropoffLocation, startLocation);
      return {
        deviation: Math.round(detour * 10) / 10,
        matchScore: Math.max(0, Math.round((1 - detour / roundTripKm) * 100)),
      };
    }

    // Point-to-point
    if (!startLocation) return { deviation: 0, matchScore: 50 };

    if (!endLocation) {
      // Only start set — rank by distance to pickup
      const d = haversineKm(startLocation, e.pickupLocation);
      return {
        deviation: Math.round(d * 10) / 10,
        matchScore: Math.max(0, Math.round(100 - (d / 10) * 100)),
      };
    }

    const directDist = haversineKm(startLocation, endLocation);
    const withErrand =
      haversineKm(startLocation, e.pickupLocation) +
      haversineKm(e.pickupLocation, e.dropoffLocation) +
      haversineKm(e.dropoffLocation, endLocation);
    const detour = Math.max(0, withErrand - directDist);
    return {
      deviation: Math.round(detour * 10) / 10,
      matchScore: Math.max(0, Math.round(100 * (1 - detour / Math.max(maxDetourKm, 0.1)))),
    };
  };

  const availableErrands = errands
    .filter(e => !queuedIds.has(e.id))
    .filter(e => {
      const windowMs = (urgencyWindowMinutes[e.urgency] ?? 120) * 60 * 1000;
      return new Date(e.requestedTime).getTime() + windowMs > Date.now();
    })
    .filter(e => filterUrgency === "all" || e.urgency === filterUrgency)
    .filter(e => {
      if (routeMode === "round-trip") {
        if (!startLocation) return true;
        const detour =
          haversineKm(startLocation, e.pickupLocation) +
          haversineKm(e.pickupLocation, e.dropoffLocation) +
          haversineKm(e.dropoffLocation, startLocation);
        return detour <= roundTripKm;
      }
      // Point-to-point: filter by maxDetourKm when both endpoints are set
      if (!startLocation || !endLocation) return true;
      const directDist = haversineKm(startLocation, endLocation);
      const withErrand =
        haversineKm(startLocation, e.pickupLocation) +
        haversineKm(e.pickupLocation, e.dropoffLocation) +
        haversineKm(e.dropoffLocation, endLocation);
      return withErrand - directDist <= maxDetourKm;
    })
    .map(e => {
      const timingDiff = Math.abs(new Date(e.requestedTime).getTime() - departureTime.getTime()) / 60000;
      return { ...e, timingDiff, ...scoreErrand(e) };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  const totalEarnings = queuedErrands.reduce((sum, e) => sum + e.payment + (e.tip || 0), 0);

  const handleRemoveErrand = (errandId: string) => {
    setQueuedErrands(prev => prev.filter(e => e.id !== errandId));
  };

  const COMPLETION_RADIUS_KM = 0.3; // 300 metres

  const handleCompleteErrand = (errand: Errand) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device.");
      return;
    }
    toast("Checking your location...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const cyclistLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude, address: "" } as Location;
        const distKm = haversineKm(cyclistLoc, errand.dropoffLocation);
        if (distKm > COMPLETION_RADIUS_KM) {
          toast.error(`You're ${(distKm * 1000).toFixed(0)} m from the dropoff. Get within 300 m to complete.`);
          return;
        }
        try {
          await Promise.all([
            updateDoc(doc(db, "errands", errand.id), {
              status: "completed",
              completedAt: new Date().toISOString(),
            }),
            updateDoc(doc(db, "users", errand.customerId), {
              "customer.totalTrips": increment(1),
            }),
            ...(user ? [addDoc(collection(db, "users", user.id, "rides"), {
              errandId: errand.id,
              earnings: errand.payment,
              tip: errand.tip ?? 0,
              completedAt: new Date().toISOString(),
              description: errand.description,
              from: errand.pickupLocation.address,
              to: errand.dropoffLocation.address,
              status: "completed",
            })] : []),
          ]);
          setQueuedErrands(prev => prev.filter(e => e.id !== errand.id));
          toast.success(`Delivery complete! +$${(errand.payment + (errand.tip ?? 0)).toFixed(2)}`);
        } catch {
          toast.error("Failed to complete errand.");
        }
      },
      () => toast.error("Could not get your location. Please enable GPS."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleEndTrip = () => {
    const lastErrand = queuedErrands[queuedErrands.length - 1];
    const destination = lastErrand?.dropoffLocation ?? null;
    if (!destination) {
      toast.error("No errand dropoff location to verify against.");
      return;
    }
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device.");
      return;
    }
    toast("Verifying your location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const cyclistLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude, address: "" } as Location;
        const distKm = haversineKm(cyclistLoc, destination);
        if (distKm > COMPLETION_RADIUS_KM) {
          toast.error(
            `You're ${(distKm * 1000).toFixed(0)} m from the final dropoff. Get within 300 m to end the trip.`
          );
          return;
        }
        setRideCompleted(true);
        toast.success("Trip complete! Location verified.");
      },
      () => toast.error("Could not get your location. Please enable GPS."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6" style={{ paddingBottom: queuedErrands.length > 0 && !routeStarted ? "120px" : routeStarted && !rideCompleted ? "88px" : "24px" }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/cyclist")}
            className="flex items-center gap-2 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-gray-900">Active Route</h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="px-4 pt-4">
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setRouteMode("point-to-point")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition ${
              routeMode === "point-to-point"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500"
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            Point to Point
          </button>
          <button
            onClick={() => setRouteMode("round-trip")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition ${
              routeMode === "round-trip"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500"
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            Round Trip
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="p-4">
        <MapView
          startLocation={startLocation ?? undefined}
          endLocation={
            routeMode === "point-to-point"
              ? (endLocation ?? undefined)
              : (queuedErrands.length > 0 ? startLocation ?? undefined : undefined)
          }
          waypoints={queuedErrands.flatMap(e => [e.pickupLocation, e.dropoffLocation])}
          radiusKm={routeMode === "round-trip" && startLocation ? roundTripKm / 2 : undefined}
          className="h-64"
        />
      </div>

      {/* Route info */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-600" />
              <span className="text-gray-900">Your Route</span>
            </div>
            <Badge className={routeStarted ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
              {routeStarted ? "Active" : "Planning"}
            </Badge>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">Start</div>
                <PlacesAutocomplete
                  value={startAddress}
                  onChange={setStartAddress}
                  onPlaceSelect={(loc) => {
                    setStartLocation(loc);
                    setStartAddress(loc.address);
                  }}
                  placeholder="Search start location"
                />
              </div>
            </div>

            {routeMode === "point-to-point" && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">To</div>
                    <PlacesAutocomplete
                      value={endAddress}
                      onChange={setEndAddress}
                      onPlaceSelect={(loc) => {
                        setEndLocation(loc);
                        setEndAddress(loc.address);
                      }}
                      placeholder="Search destination"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Max detour distance</span>
                    <span className="text-blue-600">{maxDetourKm} km</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={20}
                    step={0.5}
                    value={maxDetourKm}
                    onChange={e => setMaxDetourKm(Number(e.target.value))}
                    className="w-full accent-blue-600 h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #2563eb ${((maxDetourKm - 0.5) / (20 - 0.5)) * 100}%, #e5e7eb ${((maxDetourKm - 0.5) / (20 - 0.5)) * 100}%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0.5 km</span>
                    <span>20 km</span>
                  </div>
                </div>
              </>
            )}

            {routeMode === "round-trip" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Max round trip distance</span>
                  <span className="text-blue-600">{roundTripKm} km</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={50}
                  step={1}
                  value={roundTripKm}
                  onChange={e => setRoundTripKm(Number(e.target.value))}
                  className="w-full accent-blue-600 h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #2563eb ${((roundTripKm - 2) / (50 - 2)) * 100}%, #e5e7eb ${((roundTripKm - 2) / (50 - 2)) * 100}%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>2 km</span>
                  <span>50 km</span>
                </div>
              </div>
            )}

            {/* Departure time */}
            <div className="space-y-2">
              <div className="text-xs text-gray-500">Departure</div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDepartureMode("now")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition ${
                    departureMode === "now"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Leave Now
                </button>
                <button
                  onClick={() => setDepartureMode("scheduled")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition ${
                    departureMode === "scheduled"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200"
                  }`}
                >
                  <CalendarClock className="w-4 h-4" />
                  Schedule
                </button>
              </div>
              {departureMode === "scheduled" && (
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={e => setScheduledTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          </div>

          {queuedErrands.length > 0 && (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <PackageCheck className="w-4 h-4 text-green-600" />
                  {queuedErrands.length} job{queuedErrands.length > 1 ? "s" : ""} queued
                </span>
                <span className="text-green-600">${totalEarnings.toFixed(2)}</span>
              </div>
              {queuedErrands.map((e, i) => (
                <div key={e.id} className="flex items-start gap-2 bg-green-50 rounded-lg p-2 text-sm">
                  <div className="bg-green-600 text-white w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-800 truncate">{e.description}</div>
                    <div className="text-gray-500 text-xs truncate">{e.pickupLocation.address} → {e.dropoffLocation.address}</div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-green-700 text-xs">+${(e.payment + (e.tip ?? 0)).toFixed(2)}</span>
                    {routeStarted ? (
                      <button
                        onClick={() => handleCompleteErrand(e)}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-0.5 rounded-full"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Done
                      </button>
                    ) : (
                      <button onClick={() => handleRemoveErrand(e.id)} className="text-gray-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Matched errands */}
      <div className="px-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-gray-900">Matched Errands</h2>
            <p className="text-sm text-gray-600">
              {availableErrands.length} errands{" "}
              {routeMode === "round-trip"
                ? `within ${roundTripKm} km round trip`
                : startLocation && endLocation
                  ? `within ${maxDetourKm} km detour of your route`
                  : "along your route"}
            </p>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {["all", "urgent", "soon", "flexible"].map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterUrgency(filter)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
                filterUrgency === filter
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Algorithm explanation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="text-blue-900 mb-1">Smart Matching Algorithm</div>
            <div className="text-blue-700">
              {routeMode === "round-trip"
                ? `All errands ranked by fit against your ${roundTripKm} km round-trip budget: Great = detour under 15% of budget and timing within 10 min · Good = detour 15–35% and timing within 20 min · Bad = detour over 35% or timing mismatch.`
                : "Errands ranked by route alignment and timing. Great = detour under 15% of your route and timing within 10 min · Good = detour 15–35% and timing within 20 min · Bad = detour over 35% or timing mismatch."}
            </div>
          </div>
        </div>

        {/* Errand list */}
        <div className="space-y-3">
          {availableErrands.map((errand) => (
            <ErrandCard
              key={errand.id}
              errand={errand}
              onAccept={handleAcceptErrand}
              showMatchScore={true}
            />
          ))}
        </div>

        {availableErrands.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No errands match your current filters</p>
          </div>
        )}
      </div>

      {/* Ride completed banner */}
      {rideCompleted && (
        <div className="mx-4 mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <div className="text-green-900">Ride complete!</div>
            <div className="text-sm text-green-700">Location verified. You earned <span className="font-medium">${totalEarnings.toFixed(2)}</span> today.</div>
          </div>
        </div>
      )}

      {/* Sticky End Trip bar */}
      {routeStarted && !rideCompleted && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-xl">
          <Button
            onClick={handleEndTrip}
            className="w-full bg-red-600 hover:bg-red-700 h-12 text-base"
          >
            End Trip & Verify Location
          </Button>
        </div>
      )}

      {/* Sticky Start Trip bar */}
      {queuedErrands.length > 0 && !routeStarted && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-gray-500">{queuedErrands.length} job{queuedErrands.length > 1 ? "s" : ""} · {queuedErrands.length * 2 + 2} stops</div>
              <div className="text-lg text-gray-900">Total: <span className="text-green-600">${totalEarnings.toFixed(2)}</span></div>
            </div>
            <Button
              onClick={async () => {
                if (!startLocation) {
                  toast.error("Please set your start location first.");
                  return;
                }
                if (routeMode === "point-to-point" && !endLocation) {
                  toast.error("Please set your end location first.");
                  return;
                }
                const origin = encodeURIComponent(startAddress);
                const destination = routeMode === "round-trip"
                  ? encodeURIComponent(startAddress)
                  : encodeURIComponent(endAddress);

                const stops = queuedErrands
                  .flatMap(e => [e.pickupLocation.address, e.dropoffLocation.address])
                  .map(encodeURIComponent)
                  .join("|");

                const url = stops
                  ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${stops}&travelmode=bicycling`
                  : `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=bicycling`;
                window.open(url, "_blank");
                setRouteStarted(true);

                // Save cyclist's start location to each errand so customer can see the route
                await Promise.all(
                  queuedErrands.map(e =>
                    updateDoc(doc(db, "errands", e.id), {
                      status: "in-progress",
                      cyclistStartLocation: startLocation,
                      tripStartedAt: new Date().toISOString(),
                    })
                  )
                );
              }}
              className="bg-green-600 hover:bg-green-700 h-12 px-6 text-base"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Trip
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
