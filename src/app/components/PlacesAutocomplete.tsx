import { useRef } from "react";
import { Autocomplete } from "@react-google-maps/api";
import { Location } from "../types";

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (location: Location) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

export default function PlacesAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Search address...",
  id,
  className = "",
}: PlacesAutocompleteProps) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;

    const location: Location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      address: place.formatted_address ?? place.name ?? "",
    };

    onChange(location.address);
    onPlaceSelect(location);
  };

  return (
    <Autocomplete
      onLoad={(ref) => (autocompleteRef.current = ref)}
      onPlaceChanged={handlePlaceChanged}
    >
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${className}`}
      />
    </Autocomplete>
  );
}
