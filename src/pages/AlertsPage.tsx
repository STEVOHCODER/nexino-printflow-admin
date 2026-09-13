import { useState, useEffect } from "react";
import { Bell, BellOff, Check, Trash2 } from "lucide-react";
import AlertItem from "../components/AlertItem";
import { getAlerts, acknowledgeAlert, dismissAlert } from "../lib/api";
import type { Alert, AlertType } from "../lib/types";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "acknowledged">("active");
  const [typeFilter, setTypeFilter] = useState<AlertType | "">("");

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      setLoading(true);
      const res = await getAlerts();
      setAlerts(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAcknowledge(id: string) {
    try {
      await acknowledgeAlert(id);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
      );
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDismiss(id: string) {
    try {
      await dismissAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  }

  const filtered = alerts.filter((a) => {
    if (filter === "active" && a.acknowledged) return false;
    if (filter === "acknowledged" && !a.acknowledged) return false;
    if (typeFilter && a.type !== typeFilter) return false;
    return true;
  });

  const activeCount = alerts.filter((a) => !a.acknowledged).length;
  const criticalCount = alerts.filter((a) => !a.acknowledged && (a.severity === "critical" || a.severity === "error")).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Alerts</h3>
          <p className="text-sm text-gray-500 mt-1">
            {activeCount} active alerts
            {criticalCount > 0 && (
              <span className="text-red-600 font-medium"> ({criticalCount} critical)</span>
            )}
          </p>
        </div>
        {activeCount > 0 && (
          <button
            onClick={() => {
              alerts
                .filter((a) => !a.acknowledged)
                .forEach((a) => handleAcknowledge(a.id));
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Check className="w-4 h-4" />
            Acknowledge All
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {(["active", "acknowledged", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                filter === f
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as AlertType | "")}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All types</option>
          <option value="printer_offline">Printer Offline</option>
          <option value="paper_low">Paper Low</option>
          <option value="paper_empty">Paper Empty</option>
          <option value="toner_low">Toner Low</option>
          <option value="printer_error">Printer Error</option>
          <option value="failed_print">Failed Print</option>
          <option value="agent_disconnected">Agent Disconnected</option>
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BellOff className="w-8 h-8 text-green-500" />
          </div>
          <h4 className="text-lg font-medium text-gray-900">All clear!</h4>
          <p className="text-sm text-gray-500 mt-1">
            {filter === "active" ? "No active alerts." : "No alerts match your filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onAcknowledge={handleAcknowledge}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      )}
    </div>
  );
}
