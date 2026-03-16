import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import MapView from "../components/MapView";
import ErrandCard from "../components/ErrandCard";
import { 
  ArrowLeft, 
  Navigation, 
  Play, 
  Filter,
  AlertCircle
} from "lucide-react";
import { mockCurrentRoute, mockErrands } from "../data/mockData";
import { toast } from "sonner";

export default function CyclistActiveRoute() {
  const navigate = useNavigate();
  const [routeStarted, setRouteStarted] = useState(false);
  const [acceptedErrands, setAcceptedErrands] = useState<string[]>([]);
  const [filterUrgency, setFilterUrgency] = useState<string>("all");

  const handleAcceptErrand = (errandId: string) => {
    setAcceptedErrands([...acceptedErrands, errandId]);
    const errand = mockErrands.find(e => e.id === errandId);
    toast.success(`Errand accepted! +$${errand?.payment.toFixed(2)}`);
  };

  const availableErrands = mockErrands
    .filter(e => !acceptedErrands.includes(e.id))
    .filter(e => filterUrgency === "all" || e.urgency === filterUrgency)
    .sort((a, b) => b.matchScore - a.matchScore);

  const totalEarnings = mockErrands
    .filter(e => acceptedErrands.includes(e.id))
    .reduce((sum, e) => sum + e.payment + (e.tip || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
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
          startLocation={mockCurrentRoute.startLocation}
          endLocation={mockCurrentRoute.endLocation}
          waypoints={mockCurrentRoute.waypoints}
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
          
          <div className="space-y-2 text-sm mb-4">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
              <div className="flex-1">
                <div className="text-gray-600">From</div>
                <div className="text-gray-900">{mockCurrentRoute.startLocation.address}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full mt-1.5"></div>
              <div className="flex-1">
                <div className="text-gray-600">To</div>
                <div className="text-gray-900">{mockCurrentRoute.endLocation.address}</div>
              </div>
            </div>
          </div>

          {acceptedErrands.length > 0 && (
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-gray-600">Potential earnings</span>
              <span className="text-xl text-green-600">${totalEarnings.toFixed(2)}</span>
            </div>
          )}

          {!routeStarted && (
            <Button 
              onClick={() => setRouteStarted(true)}
              className="w-full bg-green-600 hover:bg-green-700 mt-3"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Route
            </Button>
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
    </div>
  );
}