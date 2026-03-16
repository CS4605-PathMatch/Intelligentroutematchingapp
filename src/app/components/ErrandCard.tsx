import { Errand } from "../types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MapPin, Clock, DollarSign, Star, TrendingUp, Shield } from "lucide-react";

interface ErrandCardProps {
  errand: Errand;
  onAccept?: (errandId: string) => void;
  showMatchScore?: boolean;
}

export default function ErrandCard({ errand, onAccept, showMatchScore = true }: ErrandCardProps) {
  const urgencyColors = {
    flexible: "bg-gray-100 text-gray-700",
    soon: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700",
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-orange-600";
    return "text-gray-600";
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-4">
      {/* Header with match score */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-900">{errand.customerName}</span>
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-gray-700">{errand.customerRating}</span>
            </div>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600">{errand.description}</p>
        </div>
        {showMatchScore && (
          <div className={`text-right ${getMatchScoreColor(errand.matchScore)}`}>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-lg">{errand.matchScore}%</span>
            </div>
            <div className="text-xs text-gray-500">match</div>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="flex flex-wrap gap-2">
        {errand.items.map((item, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {item}
          </Badge>
        ))}
      </div>

      {/* Location and timing info */}
      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2 text-gray-600">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
          <div className="flex-1">
            <div className="text-gray-900">{errand.pickupLocation.address}</div>
            <div className="text-gray-500">→ {errand.dropoffLocation.address}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{formatTime(errand.requestedTime)}</span>
          </div>
          <Badge className={urgencyColors[errand.urgency]}>
            {errand.urgency}
          </Badge>
        </div>
      </div>

      {/* Deviation and payment */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="space-y-1">
          <div className="text-sm text-gray-600">
            +{errand.deviation} km detour
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <DollarSign className="w-4 h-4" />
            <span className="text-lg">${errand.payment.toFixed(2)}</span>
            {errand.tip && (
              <span className="text-sm text-gray-500">+ ${errand.tip.toFixed(2)} tip</span>
            )}
          </div>
        </div>
        
        {onAccept && (
          <Button 
            onClick={() => onAccept(errand.id)}
            className="bg-green-600 hover:bg-green-700"
          >
            Accept
          </Button>
        )}
      </div>
    </div>
  );
}
