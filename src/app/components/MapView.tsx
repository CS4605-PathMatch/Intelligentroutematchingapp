import { useState, useEffect } from "react";
import {
  GoogleMap,
  DirectionsRenderer,
  MarkerF,
  CircleF,
} from "@react-google-maps/api";
import { Location } from "../types";

interface MapViewProps {
  startLocation?: Location;
  endLocation?: Location;
  currentLocation?: Location;
  waypoints?: Location[];
  radiusKm?: number;
  className?: string;
}

const mapContainerStyle = { width: "100%", height: "100%" };

const defaultCenter = { lat: 40.7128, lng: -74.006 }; // NYC default

export default function MapView({
  startLocation,
  endLocation,
  currentLocation,
  waypoints = [],
  radiusKm,
  className = "",
}: MapViewProps) {
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);

  useEffect(() => {
    if (!startLocation || !endLocation) {
      setDirections(null);
      return;
    }

    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin: { lat: startLocation.lat, lng: startLocation.lng },
        destination: { lat: endLocation.lat, lng: endLocation.lng },
        waypoints: waypoints.map((wp) => ({
          location: { lat: wp.lat, lng: wp.lng },
          stopover: false,
        })),
        travelMode: google.maps.TravelMode.BICYCLING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        } else {
          setDirections(null);
        }
      }
    );
  }, [startLocation, endLocation, waypoints]);

  const center = currentLocation
    ? { lat: currentLocation.lat, lng: currentLocation.lng }
    : startLocation
    ? { lat: startLocation.lat, lng: startLocation.lng }
    : defaultCenter;

  // Zoom out enough to show the radius circle (approx: each zoom level halves the view)
  const zoomForRadius = radiusKm
    ? Math.round(14 - Math.log2(radiusKm))
    : 13;

  const leg = directions?.routes[0]?.legs[0];
  const duration = leg?.duration?.text ?? null;
  const distance = leg?.distance?.text ?? null;

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoomForRadius}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {directions ? (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: false,
              polylineOptions: { strokeColor: "#2563eb", strokeWeight: 4 },
            }}
          />
        ) : (
          <>
            {startLocation && (
              <MarkerF
                position={{ lat: startLocation.lat, lng: startLocation.lng }}
                label={{ text: "A", color: "white" }}
              />
            )}
            {endLocation && (
              <MarkerF
                position={{ lat: endLocation.lat, lng: endLocation.lng }}
                label={{ text: "B", color: "white" }}
              />
            )}
          </>
        )}

        {currentLocation && (
          <MarkerF
            position={{ lat: currentLocation.lat, lng: currentLocation.lng }}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
            }}
          />
        )}

        {waypoints.map((wp, i) => (
          <MarkerF
            key={i}
            position={{ lat: wp.lat, lng: wp.lng }}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png",
            }}
          />
        ))}

        {radiusKm && startLocation && (
          <CircleF
            center={{ lat: startLocation.lat, lng: startLocation.lng }}
            radius={radiusKm * 1000}
            options={{
              fillColor: "#2563eb",
              fillOpacity: 0.08,
              strokeColor: "#2563eb",
              strokeOpacity: 0.4,
              strokeWeight: 2,
            }}
          />
        )}
      </GoogleMap>

      {(duration || distance) && (
        <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md text-sm z-10">
          {distance && <div className="text-gray-600">{distance}</div>}
          {duration && <div className="text-gray-900 font-medium">{duration}</div>}
        </div>
      )}
    </div>
  );
}
