import { MapPin, Navigation } from "lucide-react";
import { Location } from "../types";

interface MapViewProps {
  startLocation?: Location;
  endLocation?: Location;
  currentLocation?: Location;
  waypoints?: Location[];
  className?: string;
}

export default function MapView({ 
  startLocation, 
  endLocation, 
  currentLocation,
  waypoints = [],
  className = "" 
}: MapViewProps) {
  return (
    <div className={`relative bg-gray-200 rounded-xl overflow-hidden ${className}`}>
      {/* Simulated map background */}
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Route visualization */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="relative w-full h-full">
          {/* Start location */}
          {startLocation && (
            <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg">
                <Navigation className="w-4 h-4" />
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap">
                Start
              </div>
            </div>
          )}

          {/* Waypoints */}
          {waypoints.map((waypoint, index) => (
            <div 
              key={index}
              className="absolute"
              style={{
                top: `${40 + index * 10}%`,
                left: `${40 + index * 10}%`,
              }}
            >
              <div className="bg-orange-500 text-white p-2 rounded-full shadow-lg">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
          ))}

          {/* Current location (for tracking) */}
          {currentLocation && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse">
              <div className="bg-green-600 text-white p-3 rounded-full shadow-lg ring-4 ring-green-300">
                <Bike className="w-5 h-5" />
              </div>
            </div>
          )}

          {/* End location */}
          {endLocation && (
            <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2">
              <div className="bg-red-600 text-white p-2 rounded-full shadow-lg">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap">
                Destination
              </div>
            </div>
          )}

          {/* Route line */}
          {startLocation && endLocation && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line
                x1="25%"
                y1="25%"
                x2="75%"
                y2="75%"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeDasharray="5,5"
                opacity="0.6"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Distance/time overlay */}
      <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md text-sm">
        <div className="text-gray-600">Estimated time</div>
        <div className="text-gray-900">15-20 min</div>
      </div>
    </div>
  );
}

// Missing import for Bike icon
import { Bike } from "lucide-react";
