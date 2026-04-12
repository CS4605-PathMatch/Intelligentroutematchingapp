import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { ArrowLeft, Camera, CreditCard, CheckCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { storage, db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export default function IdVerification() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [idPhoto, setIdPhoto] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (!idPhoto || !selfie) {
      toast.error("Please provide both your ID photo and selfie.");
      return;
    }
    setSubmitting(true);
    try {
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
        "cyclist.avatar": selfieUrl,
        "cyclist.idVerificationStatus": "pending",
      });

      updateUser({ avatar: selfieUrl, idVerificationStatus: "pending" });
      toast.success("Verification submitted! We'll review your ID shortly.");
      navigate(-1);
    } catch (err: any) {
      toast.error(err.message || "Upload failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-sm w-full space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

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
            onClick={handleSubmit}
            disabled={submitting || !idPhoto || !selfie}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? "Uploading..." : "Submit Verification"}
          </Button>
        </div>
      </div>
    </div>
  );
}
