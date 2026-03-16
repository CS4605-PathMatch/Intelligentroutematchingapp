import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Bike, Package } from "lucide-react";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-sm w-full space-y-6 text-center">
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 p-4 rounded-full">
              <Bike className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl text-gray-900">PathMatch</h1>
          <p className="text-gray-600">
            Connecting cyclists with customers for convenient, eco-friendly deliveries
          </p>
        </div>

        <div className="space-y-4 pt-8">
          {/* Cyclist card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Bike className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-gray-900">I'm a Cyclist</h3>
                <p className="text-sm text-gray-600">Earn money on routes you're already taking</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                onClick={() => navigate("/login?role=cyclist")}
              >
                Sign In
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate("/signup?role=cyclist")}
              >
                Sign Up
              </Button>
            </div>
          </div>

          {/* Customer card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-gray-900">I Need Help</h3>
                <p className="text-sm text-gray-600">Get errands done quickly and affordably</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-green-200 text-green-600 hover:bg-green-50"
                onClick={() => navigate("/login?role=customer")}
              >
                Sign In
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => navigate("/signup?role=customer")}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-6 space-y-2">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span className="text-green-600">✓</span>
              <span>Identity Verified</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-600">✓</span>
              <span>Safe & Secure</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Lower fees than traditional delivery • Fair compensation for cyclists
          </p>
        </div>
      </div>
    </div>
  );
}
