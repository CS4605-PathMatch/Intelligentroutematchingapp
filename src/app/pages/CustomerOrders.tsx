import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  Package,
  Loader2,
} from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { Errand } from "../types";

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  pending:       { label: "Finding cyclist", classes: "bg-yellow-100 text-yellow-700" },
  matched:       { label: "Matched",         classes: "bg-blue-100 text-blue-700" },
  "in-progress": { label: "En Route",        classes: "bg-green-100 text-green-700" },
  completed:     { label: "Completed",       classes: "bg-gray-100 text-gray-600" },
};

export default function CustomerOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [errands, setErrands] = useState<Errand[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "history">("active");

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "errands"), where("customerId", "==", user.id));
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Errand));
      data.sort((a, b) =>
        ((b as any).createdAt ?? "").localeCompare((a as any).createdAt ?? "")
      );
      setErrands(data);
      setLoading(false);
    });
  }, [user]);

  const active = errands.filter((e) =>
    e.status === "pending" || e.status === "matched" || e.status === "in-progress"
  );
  const history = errands.filter((e) => e.status === "completed");

  const shown = tab === "active" ? active : history;

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/customer")}
            className="flex items-center gap-2 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-gray-900">My Orders</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setTab("active")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition ${
              tab === "active" ? "bg-white text-green-600 shadow-sm" : "text-gray-500"
            }`}
          >
            <Loader2 className="w-4 h-4" />
            Active
            {active.length > 0 && (
              <span className="bg-green-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {active.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("history")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition ${
              tab === "history" ? "bg-white text-green-600 shadow-sm" : "text-gray-500"
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
            {tab === "active" ? "No active orders right now." : "No completed orders yet."}
          </div>
        ) : (
          shown.map((errand) => {
            const cfg = STATUS_CONFIG[errand.status] ?? { label: errand.status, classes: "bg-gray-100 text-gray-600" };
            const total = errand.payment + (errand.tip ?? 0);
            const isClickable = errand.status !== "completed";
            return (
              <Card
                key={errand.id}
                className={`p-4 ${isClickable ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
                onClick={isClickable ? () => navigate(`/customer/track/${errand.id}`) : undefined}
              >
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
                    <span className="text-gray-700 text-sm">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Cyclist info if assigned */}
                {(errand as any).cyclistName && (
                  <div className="flex items-center gap-2 py-2 border-t border-gray-100 text-sm text-gray-600">
                    <img
                      src={(errand as any).cyclistAvatar}
                      className="w-5 h-5 rounded-full"
                      alt={(errand as any).cyclistName}
                    />
                    <span>{(errand as any).cyclistName}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date((errand as any).createdAt).toLocaleDateString("en-US", {
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
                      ${errand.payment.toFixed(2)}
                      {(errand.tip ?? 0) > 0 && ` + $${errand.tip!.toFixed(2)} tip`}
                    </span>
                  </div>
                </div>

                {isClickable && (
                  <div className="text-xs text-green-600 text-right mt-1">Tap to track →</div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
