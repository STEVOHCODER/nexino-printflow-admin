import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, MapPin, Edit2, Trash2, QrCode, X, Check, ChevronDown, Download, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import DataTable, { Column } from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { getStations, createStation, updateStation, deleteStation } from "../lib/api";
import { formatDate } from "../components/dateUtils";
import type { Station } from "../lib/types";

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Station | null>(null);
  const [showQR, setShowQR] = useState<Station | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const [serverIP, setServerIP] = useState("localhost");

  const [form, setForm] = useState({ name: "", location: "", stationCode: "" });

  useEffect(() => {
    fetchServerIP();
  }, []);

  async function fetchServerIP() {
    try {
      const res = await fetch("/api/admin/network-info");
      const data = await res.json();
      if (data.success && data.data.primaryIp) {
        setServerIP(data.data.primaryIp);
      }
    } catch {}
  }

  const getStationUrl = useCallback((station: Station) => {
    return `http://${serverIP}:5174/station/${station.id}`;
  }, [serverIP]);

  async function downloadQR() {
    if (!qrRef.current || !showQR) return;
    const svgEl = qrRef.current.querySelector("svg");
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 0, 0, 400, 400);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `QR-${showQR.stationCode || showQR.name}.png`;
      link.href = pngUrl;
      link.click();
    };
    img.src = url;
  }

  function printQR() {
    if (!qrRef.current || !showQR) return;
    const stationUrl = getStationUrl(showQR);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const svgEl = qrRef.current.querySelector("svg");
    const svgData = svgEl ? new XMLSerializer().serializeToString(svgEl) : "";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>QR Code - ${showQR.name}</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
          h2 { margin-bottom: 8px; }
          p { color: #666; margin: 4px 0; }
          svg { margin: 20px auto; }
          .url { font-size: 10px; color: #999; word-break: break-all; margin-top: 16px; }
        </style>
        </head>
        <body>
          <h2>${showQR.name}</h2>
          <p>${showQR.location}</p>
          ${svgData}
          <p class="url">${stationUrl}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  }

  useEffect(() => {
    loadStations();
  }, []);

  async function loadStations() {
    try {
      setLoading(true);
      const res = await getStations();
      setStations(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: "", location: "", stationCode: "" });
    setShowForm(true);
  }

  function openEdit(station: Station) {
    setEditing(station);
    setForm({ name: station.name, location: station.location, stationCode: station.stationCode });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        await updateStation(editing.id, { name: form.name, location: form.location });
      } else {
        await createStation(form);
      }
      setShowForm(false);
      loadStations();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this station?")) return;
    try {
      await deleteStation(id);
      loadStations();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleToggleActive(station: Station) {
    try {
      await updateStation(station.id, { isActive: !station.isActive });
      loadStations();
    } catch (err: any) {
      alert(err.message);
    }
  }

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: "stationCode",
      label: "Code",
      sortable: true,
      className: "w-[110px]",
      render: (item) => (
        <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{item.stationCode as string}</span>
      ),
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (item) => <span className="font-medium text-gray-900">{item.name as string}</span>,
    },
    {
      key: "location",
      label: "Location",
      sortable: true,
      className: "hidden md:table-cell",
      render: (item) => (
        <span className="text-gray-600 flex items-center gap-1 truncate">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          {item.location as string}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true,
      render: (item) => (
        <StatusBadge variant={item.isActive ? "success" : "neutral"} dot>
          {item.isActive ? "Active" : "Inactive"}
        </StatusBadge>
      ),
    },
    {
      key: "agentId",
      label: "Agent",
      sortable: true,
      className: "hidden xl:table-cell",
      render: (item) => item.agentId ? (
        <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono">{String(item.agentId).substring(0, 12)}...</span>
      ) : (
        <span className="text-xs text-gray-400">Manual</span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      className: "hidden lg:table-cell",
      render: (item) => <span className="text-gray-500 text-xs whitespace-nowrap">{formatDate(item.createdAt as string)}</span>,
    },
    {
      key: "actions",
      label: "",
      className: "w-[100px]",
      render: (item) => {
        const station = item as unknown as Station;
        return (
          <div className="flex items-center gap-0.5">
            <button
              onClick={(e) => { e.stopPropagation(); setShowQR(station); }}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="View QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleToggleActive(station); }}
              className={`p-1 rounded-md transition-colors ${
                station.isActive
                  ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                  : "text-gray-400 hover:text-green-600 hover:bg-green-50"
              }`}
              title={station.isActive ? "Deactivate" : "Activate"}
            >
              {station.isActive ? <ChevronDown className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); openEdit(station); }}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(station.id); }}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Stations</h3>
          <p className="text-sm text-gray-500 mt-1">{stations.length} total stations</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Station
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
      )}

      <DataTable
        columns={columns}
        data={stations as unknown as Record<string, unknown>[]}
        pageSize={10}
        emptyMessage="No stations found. Create your first station."
      />

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editing ? "Edit Station" : "Create Station"}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Main Campus Station"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Building A, Floor 1"
                />
              </div>
              {!editing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Station Code (optional)</label>
                  <input
                    type="text"
                    value={form.stationCode}
                    onChange={(e) => setForm({ ...form, stationCode: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Auto-generated if empty"
                  />
                </div>
              )}
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
                  {editing ? "Save Changes" : "Create Station"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && (() => {
        const stationUrl = getStationUrl(showQR);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowQR(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Station QR Code</h3>
                <button onClick={() => setShowQR(null)} className="p-1 text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-center">
                <div ref={qrRef} className="w-48 h-48 bg-white rounded-xl flex items-center justify-center mx-auto border-2 border-gray-100 p-2">
                  <QRCodeSVG
                    value={stationUrl}
                    size={180}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <p className="text-sm font-medium text-gray-900 mt-4">{showQR.name}</p>
                <p className="text-xs text-gray-500 mt-1">{showQR.location}</p>
                <p className="text-xs text-gray-400 mt-3 break-all">
                  {stationUrl}
                </p>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    onClick={() => navigator.clipboard.writeText(stationUrl)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Copy URL
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={downloadQR}
                    className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 font-medium"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={printQR}
                    className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 font-medium"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
