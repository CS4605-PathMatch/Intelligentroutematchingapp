import { useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Bike, Package, Eye, EyeOff, ArrowLeft, Camera, CreditCard, CheckCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { UserType } from "../types";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { storage, db } from "../lib/firebase";

const BIKE_TYPES = ["Road Bike", "Mountain Bike", "E-Bike", "Cargo Bike", "City Bike"];

type Step = "info" | "verify";

export default function SignUp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup } = useAuth();

  const initialRole = (searchParams.get("role") as UserType) ?? "cyclist";
  const [role, setRole] = useState<UserType>(initialRole);
  const [step, setStep] = useState<Step>("info");

  // Step 1 fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bikeType, setBikeType] = useState("Road Bike");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Step 2 fields
  const [idPhoto, setIdPhoto] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [createdUid, setCreatedUid] = useState<string | null>(null);

  const idInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    file: File | undefined,
    setFile: (f: File) => void,
    setPreview: (url: string) => void
  ) => {
    if (!file) return;
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await signup(name, email, password, role, role === "cyclist" ? bikeType : undefined);
      if (role === "cyclist") {
        setStep("verify");
      } else {
        toast.success("Account created! Welcome to PathMatch.");
        navigate("/customer");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async () => {
    if (!idPhoto || !selfie) {
      toast.error("Please provide both your ID photo and selfie.");
      return;
    }
    setVerifying(true);
    try {
      // Get current user UID from Firebase Auth
      const { getAuth } = await import("firebase/auth");
      const uid = getAuth().currentUser?.uid;
      if (!uid) throw new Error("Not authenticated.");

      const [idSnap, selfieSnap] = await Promise.all([
        uploadBytes(ref(storage, `id-verification/${uid}/id-photo`), idPhoto),
        uploadBytes(ref(storage, `id-verification/${uid}/selfie`), selfie),
      ]);

      const [idUrl, selfieUrl] = await Promise.all([
        getDownloadURL(idSnap.ref),
        getDownloadURL(selfieSnap.ref),
      ]);

      await updateDoc(doc(db, "users", uid), {
        "cyclist.idPhotoUrl": idUrl,
        "cyclist.selfieUrl": selfieUrl,
        "cyclist.idVerificationStatus": "pending",
      });

      toast.success("Verification submitted! We'll review your ID shortly.");
      navigate("/cyclist");
    } catch (err: any) {
      toast.error(err.message || "Upload failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  // ── Step 2: ID Verification ──────────────────────────────────────────────
  if (step === "verify") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-sm w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-3 rounded-full">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl text-gray-900">Verify your identity</h1>
            <p className="text-sm text-gray-500">Required for all cyclists. Takes under 2 minutes.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6">
            {/* ID Photo */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Government-issued ID
              </Label>
              <p className="text-xs text-gray-500">Driver's license, passport, or state ID</p>
              <input
                ref={idInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={e => handleFileChange(e.target.files?.[0], setIdPhoto, setIdPreview)}
              />
              {idPreview ? (
                <div className="relative">
                  <img src={idPreview} alt="ID preview" className="w-full h-40 object-cover rounded-lg border border-gray-200" />
                  <button
                    onClick={() => { setIdPhoto(null); setIdPreview(null); }}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-gray-500 hover:text-red-500"
                  >
                    ×
                  </button>
                  <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                    <CheckCircle className="w-3 h-3" /> Photo captured
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => idInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center gap-2 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition"
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-sm">Tap to take photo or upload</span>
                </button>
              )}
            </div>

            {/* Selfie */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Selfie
              </Label>
              <p className="text-xs text-gray-500">A clear photo of your face</p>
              <input
                ref={selfieInputRef}
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={e => handleFileChange(e.target.files?.[0], setSelfie, setSelfiePreview)}
              />
              {selfiePreview ? (
                <div className="relative">
                  <img src={selfiePreview} alt="Selfie preview" className="w-full h-40 object-cover rounded-lg border border-gray-200" />
                  <button
                    onClick={() => { setSelfie(null); setSelfiePreview(null); }}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-gray-500 hover:text-red-500"
                  >
                    ×
                  </button>
                  <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                    <CheckCircle className="w-3 h-3" /> Photo captured
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => selfieInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center gap-2 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition"
                >
                  <Camera className="w-6 h-6" />
                  <span className="text-sm">Tap to take selfie or upload</span>
                </button>
              )}
            </div>

            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              Your photos are encrypted and only used for identity verification. They will not be shared with customers.
            </div>

            <Button
              onClick={handleVerifySubmit}
              disabled={verifying || !idPhoto || !selfie}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700"
            >
              {verifying ? "Uploading..." : "Submit Verification"}
            </Button>

            <button
              onClick={() => navigate("/cyclist")}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 1: Basic Info ───────────────────────────────────────────────────
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
          <h1 className="text-2xl text-gray-900">Create account</h1>
          <p className="text-sm text-gray-500">Join PathMatch today</p>
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

        {/* Progress indicator for cyclists */}
        {role === "cyclist" && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">1</div>
              <span className="text-xs text-blue-600">Basic info</span>
            </div>
            <div className="flex-1 h-px bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-400 text-xs flex items-center justify-center">2</div>
              <span className="text-xs text-gray-400">ID verification</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleInfoSubmit} className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              placeholder="Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

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
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
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

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <div className="relative">
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {role === "cyclist" && (
            <div className="space-y-2">
              <Label htmlFor="bikeType">Bike type</Label>
              <select
                id="bikeType"
                value={bikeType}
                onChange={(e) => setBikeType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {BIKE_TYPES.map((bt) => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className={`w-full h-11 ${
              role === "cyclist"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Creating account..." : role === "cyclist" ? "Next: Verify ID" : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to={`/login?role=${role}`}
            className="text-blue-600 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
