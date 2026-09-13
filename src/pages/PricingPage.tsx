import { useState, useEffect } from "react";
import { Save, RotateCcw } from "lucide-react";

function getHeaders(): HeadersInit {
  const token = localStorage.getItem("admin_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

interface Pricing {
  bwPerPage: number;
  colorPerPage: number;
  paperA3: number;
  paperA5: number;
  duplexDiscount: number;
}

const DEFAULT_PRICING: Pricing = {
  bwPerPage: 100,
  colorPerPage: 300,
  paperA3: 1.5,
  paperA5: 0.75,
  duplexDiscount: 0.9,
};

export default function PricingPage() {
  const [globalPricing, setGlobalPricing] = useState<Pricing>(DEFAULT_PRICING);
  const [stationPricings, setStationPricings] = useState<Record<string, Pricing>>({});
  const [stations, setStations] = useState<any[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>("global");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPricing();
    loadStations();
  }, []);

  async function loadPricing() {
    try {
      const res = await fetch("/api/admin/pricing", {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setStationPricings(data.data || {});
        if (data.data._global) {
          setGlobalPricing(data.data._global);
        }
      }
    } catch {}
  }

  async function loadStations() {
    try {
      const res = await fetch("/api/admin/stations?limit=100", {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setStations(data.data || []);
      }
    } catch {}
  }

  function getCurrentPricing(): Pricing {
    if (selectedStation === "global") return globalPricing;
    return stationPricings[selectedStation] || DEFAULT_PRICING;
  }

  function updatePricing(field: keyof Pricing, value: number) {
    const pricing = getCurrentPricing();
    const updated = { ...pricing, [field]: value };
    if (selectedStation === "global") {
      setGlobalPricing(updated);
    } else {
      setStationPricings({ ...stationPricings, [selectedStation]: updated });
    }
  }

  async function savePricing() {
    setSaving(true);
    setMessage("");
    try {
      const pricing = getCurrentPricing();
      const url = selectedStation === "global"
        ? "/api/admin/pricing-global"
        : `/api/admin/pricing/${selectedStation}`;

      const res = await fetch(url, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(pricing),
      });

      if (res.ok) {
        setMessage("Pricing saved successfully!");
      } else {
        setMessage("Failed to save pricing");
      }
    } catch {
      setMessage("Error saving pricing");
    } finally {
      setSaving(false);
    }
  }

  const current = getCurrentPricing();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pricing Settings</h1>
      </div>

      {/* Station selector */}
      <div className="bg-white rounded-xl border p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Configure pricing for</label>
        <select
          value={selectedStation}
          onChange={(e) => setSelectedStation(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="global">Global (All Stations)</option>
          {stations.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.stationCode})
            </option>
          ))}
        </select>
      </div>

      {/* Pricing form */}
      <div className="bg-white rounded-xl border p-6 space-y-6">
        <h2 className="text-lg font-semibold">
          {selectedStation === "global" ? "Global Pricing" : `Station: ${stations.find(s => s.id === selectedStation)?.name || selectedStation}`}
        </h2>

        {/* Per-page rates */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Per-Page Rates (RWF)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Black & White / page</label>
              <input
                type="number"
                value={current.bwPerPage}
                onChange={(e) => updatePricing("bwPerPage", Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg text-lg font-medium"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Color / page</label>
              <input
                type="number"
                value={current.colorPerPage}
                onChange={(e) => updatePricing("colorPerPage", Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg text-lg font-medium"
              />
            </div>
          </div>
        </div>

        {/* Paper multipliers */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Paper Size Multipliers</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">A3 (× multiplier)</label>
              <input
                type="number"
                step="0.1"
                value={current.paperA3}
                onChange={(e) => updatePricing("paperA3", Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">A5 (× multiplier)</label>
              <input
                type="number"
                step="0.1"
                value={current.paperA5}
                onChange={(e) => updatePricing("paperA5", Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Duplex Discount</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={current.duplexDiscount}
                onChange={(e) => updatePricing("duplexDiscount", Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <p className="text-xs text-gray-400 mt-1">{Math.round((1 - current.duplexDiscount) * 100)}% off</p>
            </div>
          </div>
        </div>

        {/* Price preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Price Preview (1 page A4)</h3>
          <div className="flex gap-6 text-sm">
            <span>B&W: <strong>{current.bwPerPage} RWF</strong></span>
            <span>Color: <strong>{current.colorPerPage} RWF</strong></span>
            <span>A3 B&W: <strong>{Math.round(current.bwPerPage * current.paperA3)} RWF</strong></span>
            <span>A3 Color: <strong>{Math.round(current.colorPerPage * current.paperA3)} RWF</strong></span>
          </div>
        </div>

        {message && (
          <div className={`text-sm ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={savePricing}
            disabled={saving}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Pricing"}
          </button>
          <button
            onClick={() => {
              setGlobalPricing(DEFAULT_PRICING);
              setSelectedStation("global");
              setMessage("");
            }}
            className="px-6 py-2 border rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
