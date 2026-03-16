import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Bike, Package, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { UserType } from "../types";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const initialRole = (searchParams.get("role") as UserType) ?? "cyclist";
  const [role, setRole] = useState<UserType>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password, role);
      toast.success(`Welcome back!`);
      navigate(role === "cyclist" ? "/cyclist" : "/customer");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-sm w-full space-y-6">
        {/* Back */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 p-3 rounded-full">
              <Bike className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500">Sign in to your PathMatch account</p>
        </div>

        {/* Role tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setRole("cyclist")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition ${
              role === "cyclist"
                ? "bg-white text-blue-600 shadow-sm font-medium"
                : "text-gray-500"
            }`}
          >
            <Bike className="w-4 h-4" />
            Cyclist
          </button>
          <button
            onClick={() => setRole("customer")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition ${
              role === "customer"
                ? "bg-white text-green-600 shadow-sm font-medium"
                : "text-gray-500"
            }`}
          >
            <Package className="w-4 h-4" />
            Customer
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className={`w-full h-11 ${
              role === "cyclist"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to={`/signup?role=${role}`}
            className="text-blue-600 font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
