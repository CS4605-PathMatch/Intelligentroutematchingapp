import { RouterProvider } from "react-router";
import { LoadScript } from "@react-google-maps/api";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";

const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"];

export default function App() {
  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={GOOGLE_MAPS_LIBRARIES}
    >
      <RouterProvider router={router} />
      <Toaster />
    </LoadScript>
  );
}
