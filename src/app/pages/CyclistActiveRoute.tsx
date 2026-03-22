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
  X
} from "lucide-react";
import { toast } from "sonner";
import { Errand, Location } from "../types";
import { collection, addDoc, updateDoc, doc, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export default function CyclistActiveRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [errands, setErrands] = useState<Errand[]>([]);
  const [routeStarted, setRouteStarted] = useState(false);
  const [queuedErrands, setQueuedErrands] = useState<Errand[]>([]);
  const [filterUrgency, setFilterUrgency] = useState<string>("all");

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

    // Store full errand object now — it will disappear from pending list after Firestore update
    setQueuedErrands(prev => [...prev, errand]);

    if (user) {
      try {
        await Promise.all([
          // Mark errand as matched with this cyclist
          updateDoc(doc(db, "errands", errandId), {
            status: "matched",
            cyclistId: user.id,
            cyclistName: user.name,
            cyclistAvatar: user.avatar,
            cyclistRating: user.rating,
            acceptedAt: new Date().toISOString(),
          }),
          // Record earnings in cyclist's ride history
          addDoc(collection(db, "users", user.id, "rides"), {
            errandId,
            earnings: errand.payment,
            tip: errand.tip ?? 0,
            completedAt: new Date().toISOString(),
            description: errand.description,
            from: errand.pickupLocation.address,
            to: errand.dropoffLocation.address,
            status: "in-progress",
          }),
        ]);
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

  const availableErrands = errands
    .filter(e => !queuedIds.has(e.id))
    .filter(e => filterUrgency === "all" || e.urgency === filterUrgency)
    .sort((a, b) => b.matchScore - a.matchScore);

  const totalEarnings = queuedErrands.reduce((sum, e) => sum + e.payment + (e.tip || 0), 0);

  const handleRemoveErrand = (errandId: string) => {
    setQueuedErrands(prev => prev.filter(e => e.id !== errandId));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6" style={{ paddingBottom: queuedErrands.length > 0 && !routeStarted ? "120px" : "24px" }}>
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

      {/* Map */}
      <div className="p-4">
        <MapView
          startLocation={startLocation ?? undefined}
          endLocation={endLocation ?? undefined}
          waypoints={queuedErrands.flatMap(e => [e.pickupLocation, e.dropoffLocation])}
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
                <div className="text-xs text-gray-500 mb-1">From</div>
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
                    {!routeStarted && (
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
              {availableErrands.length} errands along your route
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
              Errands are ranked by proximity to your route, timing compatibility, and minimal detour distance. Higher match scores mean better alignment with your path.
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
                if (!startLocation || !endLocation) {
                  toast.error("Please set your start and end location first.");
                  return;
                }
                const origin = encodeURIComponent(startAddress);
                const destination = encodeURIComponent(endAddress);

                const stops = queuedErrands
                  .flatMap(e => [e.pickupLocation.address, e.dropoffLocation.address])
                  .map(encodeURIComponent)
                  .join("|");

                const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=optimize:true|${stops}&travelmode=bicycling`;
                window.open(url, "_blank");
                setRouteStarted(true);

                // Save cyclist's start location to each errand so customer can see the route
                await Promise.all(
                  queuedErrands.map(e =>
                    updateDoc(doc(db, "errands", e.id), {
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