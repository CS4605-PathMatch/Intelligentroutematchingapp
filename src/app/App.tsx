import { RouterProvider } from "react-router";
import { LoadScript } from "@react-google-maps/api";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";

const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"];

function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading auth…</div>;
  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <AuthProvider>
      <LoadScript
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        libraries={GOOGLE_MAPS_LIBRARIES}
      >
        <AppRoutes />
        <Toaster />
      </LoadScript>
    </AuthProvider>
  );
}
