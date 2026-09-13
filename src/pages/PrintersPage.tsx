import { useState, useEffect } from "react";
import { Plus, Printer, Wifi, WifiOff, Edit2, X, ChevronDown } from "lucide-react";
import DataTable, { Column } from "../components/DataTable";
import StatusBadge, { getPaperStatusVariant, getTonerStatusVariant } from "../components/StatusBadge";
import { getPrinters, getStations, createPrinter, updatePrinter } from "../lib/api";
import { formatDateTime } from "../components/dateUtils";
import type { Printer as PrinterType, Station } from "../lib/types";

export default function PrintersPage() {
  const [printers, setPrinters] = useState<PrinterType[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    stationId: "",
    printerUri: "",
    adapterType: "WINDOWS",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [p, s] = await Promise.all([getPrinters(), getStations()]);
      setPrinters(p);
      setStations(s);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createPrinter(form);
      setShowForm(false);
      setForm({ name: "", stationId: "", printerUri: "", adapterType: "WINDOWS" });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  }

  function getStateVariant(state: string) {
    const map: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
      IDLE: "success",
      PRINTING: "info",
      PAUSED: "warning",
      ERROR: "danger",
      OFFLINE: "neutral",
    };
    return map[state] || "neutral";
  }

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: "name",
      label: "Printer",
      sortable: true,
      render: (item) => {
        const p = item as unknown as PrinterType;
        return (
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              p.isOnline ? "bg-green-50" : "bg-gray-100"
            }`}>
              <Printer className={`w-5 h-5 ${p.isOnline ? "text-green-600" : "text-gray-400"}`} />
            </div>
            <div>
              <p className="font-medium text-gray-900">{p.name}</p>
              <p className="text-xs text-gray-500 font-mono truncate max-w-[200px]">{p.printerUri}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "station",
      label: "Station",
      sortable: true,
      render: (item) => {
        const p = item as unknown as PrinterType;
        const station = stations.find((s) => s.id === p.stationId);
        return <span className="text-gray-600">{station?.name || "Unknown"}</span>;
      },
    },
    {
      key: "isOnline",
      label: "Connection",
      sortable: true,
      render: (item) => {
        const p = item as unknown as PrinterType;
        return (
          <div className="flex items-center gap-1.5">
            {p.isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <StatusBadge variant="success" dot>Online</StatusBadge>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-gray-400" />
                <StatusBadge variant="neutral" dot>Offline</StatusBadge>
              </>
            )}
          </div>
        );
      },
    },
    {
      key: "currentState",
      label: "State",
      sortable: true,
      render: (item) => {
        const p = item as unknown as PrinterType;
        return (
          <StatusBadge variant={getStateVariant(p.currentState)}>
            {p.currentState}
          </StatusBadge>
        );
      },
    },
    {
      key: "paperStatus",
      label: "Paper",
      sortable: true,
      render: (item) => {
        const p = item as unknown as PrinterType;
        return (
          <StatusBadge variant={getPaperStatusVariant(p.paperStatus)}>
            {p.paperStatus}{p.paperLevel != null ? ` (${p.paperLevel}%)` : ""}
          </StatusBadge>
        );
      },
    },
    {
      key: "tonerStatus",
      label: "Toner",
      sortable: true,
      render: (item) => {
        const p = item as unknown as PrinterType;
        return (
          <StatusBadge variant={getTonerStatusVariant(p.tonerStatus)}>
            {p.tonerStatus}{p.tonerLevel != null ? ` (${p.tonerLevel}%)` : ""}
          </StatusBadge>
        );
      },
    },
    {
      key: "lastSeenAt",
      label: "Last Seen",
      sortable: true,
      render: (item) => {
        const p = item as unknown as PrinterType;
        return p.lastSeenAt ? (
          <span className="text-gray-500 text-xs">{formatDateTime(p.lastSeenAt)}</span>
        ) : (
          <span className="text-gray-400 text-xs">Never</span>
        );
      },
    },
    {
      key: "actions",
      label: "",
      render: (item) => {
        const p = item as unknown as PrinterType;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const newOnline = !p.isOnline;
              updatePrinter(p.id, { isOnline: newOnline }).then(loadData);
            }}
            className={`p-1.5 rounded-md transition-colors ${
              p.isOnline
                ? "text-gray-400 hover:text-red-600 hover:bg-red-50"
                : "text-gray-400 hover:text-green-600 hover:bg-green-50"
            }`}
            title={p.isOnline ? "Take Offline" : "Bring Online"}
          >
            {p.isOnline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Printers</h3>
          <p className="text-sm text-gray-500 mt-1">
            {printers.filter((p) => p.isOnline).length} online / {printers.length} total
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Printer
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={printers as unknown as Record<string, unknown>[]}
          pageSize={10}
          emptyMessage="No printers found. Add your first printer."
        />
      )}

      {/* Add Printer Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Printer</h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Printer Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. HP LaserJet Pro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Station</label>
                <select
                  value={form.stationId}
                  onChange={(e) => setForm({ ...form, stationId: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a station</option>
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Printer URI</label>
                <input
                  type="text"
                  value={form.printerUri}
                  onChange={(e) => setForm({ ...form, printerUri: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. HP_LaserJet_Pro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adapter Type</label>
                <select
                  value={form.adapterType}
                  onChange={(e) => setForm({ ...form, adapterType: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="WINDOWS">Windows</option>
                  <option value="CUPS">CUPS</option>
                  <option value="IPP">IPP</option>
                  <option value="VIRTUAL">Virtual</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Add Printer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
