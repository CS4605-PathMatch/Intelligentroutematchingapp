import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  Bike,
  Package,
  KeyRound,
} from "lucide-react";
import { collection, query, where, onSnapshot, updateDoc, doc, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { Errand } from "../types";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  matched:       { label: "Matched",   classes: "bg-blue-100 text-blue-700" },
  "in-progress": { label: "En Route",  classes: "bg-green-100 text-green-700" },
  completed:     { label: "Completed", classes: "bg-gray-100 text-gray-600" },
};

export default function CyclistErrands() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [errands, setErrands] = useState<Errand[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "history">("active");

  // Completion modal state
  const [completingErrand, setCompletingErrand] = useState<Errand | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "errands"), where("cyclistId", "==", user.id));
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Errand));
      data.sort((a, b) =>
        ((b as any).acceptedAt ?? "").localeCompare((a as any).acceptedAt ?? "")
      );
      setErrands(data);
      setLoading(false);
    });
  }, [user]);

  const active = errands.filter((e) =>
    e.status === "matched" || e.status === "in-progress"
  );
  const history = errands.filter((e) => e.status === "completed");
  const shown = tab === "active" ? active : history;

  const openModal = (errand: Errand) => {
    setCompletingErrand(errand);
    setCodeInput("");
    setCodeError(false);
  };

  const handleComplete = async () => {
    if (!completingErrand || !user) return;
    if (codeInput.trim() !== completingErrand.confirmationCode) {
      setCodeError(true);
      return;
    }
    setSubmitting(true);
    try {
      await Promise.all([
        updateDoc(doc(db, "errands", completingErrand.id), {
          status: "completed",
          completedAt: new Date().toISOString(),
        }),
        addDoc(collection(db, "users", user.id, "rides"), {
          errandId: completingErrand.id,
          earnings: completingErrand.payment,
          tip: completingErrand.tip ?? 0,
          completedAt: new Date().toISOString(),
          description: completingErrand.description,
          from: completingErrand.pickupLocation.address,
          to: completingErrand.dropoffLocation.address,
          status: "completed",
        }),
      ]);
      setCompletingErrand(null);
      toast.success("Errand completed! Payment released.");
    } catch {
      toast.error("Failed to complete errand.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/cyclist")}
            className="flex items-center gap-2 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-gray-900">My Errands</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setTab("active")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition ${
              tab === "active" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
            }`}
          >
            <Bike className="w-4 h-4" />
            Active
            {active.length > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {active.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("history")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition ${
              tab === "history" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            History
            {history.length > 0 && (
              <span className="bg-gray-400 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {history.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
        ) : shown.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            {tab === "active" ? "No active errands right now." : "No completed errands yet."}
          </div>
        ) : (
          shown.map((errand) => {
            const cfg = STATUS_CONFIG[errand.status] ?? { label: errand.status, classes: "bg-gray-100 text-gray-600" };
            const total = errand.payment + (errand.tip ?? 0);
            const canComplete = errand.status === "matched" || errand.status === "in-progress";
            return (
              <Card key={errand.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0 mr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-900 truncate">{errand.description}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <MapPin className="w-3 h-3 text-green-600 flex-shrink-0" />
                      <span className="truncate">{errand.pickupLocation.address}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
                      <span className="truncate">{errand.dropoffLocation.address}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge className={cfg.classes}>{cfg.label}</Badge>
                    <span className="text-green-600 text-sm">+${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date((errand as any).acceptedAt ?? (errand as any).createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    <span>
                      ${errand.payment.toFixed(2)} fee
                      {(errand.tip ?? 0) > 0 && ` + $${errand.tip!.toFixed(2)} tip`}
                    </span>
                  </div>
                </div>

                {canComplete && (
                  <Button
                    onClick={() => openModal(errand)}
                    className="w-full mt-3 bg-green-600 hover:bg-green-700 h-10"
                  >
                    <KeyRound className="w-4 h-4 mr-2" />
                    Enter Customer Code to Complete
                  </Button>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Completion code modal */}
      {completingErrand && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 rounded-full p-2">
                <KeyRound className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-gray-900">Confirm Delivery</div>
                <div className="text-sm text-gray-500 truncate">{completingErrand.description}</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Ask the customer for their 4-digit confirmation code to complete this delivery and release payment.
            </p>
            <Input
              type="number"
              placeholder="_ _ _ _"
              value={codeInput}
              onChange={(e) => { setCodeInput(e.target.value); setCodeError(false); }}
              className={`text-center text-2xl tracking-widest h-14 mb-2 ${codeError ? "border-red-500" : ""}`}
            />
            {codeError && (
              <p className="text-sm text-red-500 text-center mb-2">
                Incorrect code. Ask the customer to check their app.
              </p>
            )}
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setCompletingErrand(null); setCodeInput(""); setCodeError(false); }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleComplete}
                disabled={submitting}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {submitting ? "Confirming..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
