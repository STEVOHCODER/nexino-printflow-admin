import { useState, useEffect } from "react";
import { Filter, X, Download, FileText, Eye } from "lucide-react";
import DataTable, { Column } from "../components/DataTable";
import StatusBadge, { getJobStatusVariant } from "../components/StatusBadge";
import { getJobs, getStations } from "../lib/api";
import { formatCurrency, formatDateTime } from "../components/dateUtils";
import type { PrintJob, Station, JobFilters } from "../lib/types";

export default function JobsPage() {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<PrintJob | null>(null);

  const [filters, setFilters] = useState<JobFilters>({
    status: "",
    stationId: "",
    dateFrom: "",
    dateTo: "",
    limit: 15,
  });

  useEffect(() => {
    loadStations();
  }, []);

  useEffect(() => {
    loadJobs();
  }, [filters, page]);

  async function loadStations() {
    try {
      const res = await getStations();
      setStations(res);
    } catch {}
  }

  async function loadJobs() {
    try {
      setLoading(true);
      const res = await getJobs({ ...filters, page });
      setJobs(res.data);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    setPage(1);
    loadJobs();
  }

  function clearFilters() {
    setFilters({ status: "", stationId: "", dateFrom: "", dateTo: "", limit: 15 });
    setPage(1);
  }

  function getStationName(id: string) {
    return stations.find((s) => s.id === id)?.name || "Unknown";
  }

  function exportCSV() {
    const headers = ["Job ID", "Filename", "Station", "Pages", "Price", "Status", "Payment", "Date"];
    const rows = jobs.map((j) => [
      j.jobId,
      j.originalFilename,
      getStationName(j.stationId),
      j.pageCount,
      j.price,
      j.printStatus,
      j.paymentStatus,
      j.createdAt,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jobs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: "jobId",
      label: "Job ID",
      sortable: true,
      className: "w-[120px]",
      render: (item) => (
        <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
          {(item.jobId as string).slice(0, 10)}...
        </span>
      ),
    },
    {
      key: "originalFilename",
      label: "File",
      sortable: true,
      className: "max-w-[120px]",
      render: (item) => (
        <span className="text-gray-900 truncate block">{item.originalFilename as string}</span>
      ),
    },
    {
      key: "stationId",
      label: "Station",
      sortable: true,
      className: "hidden lg:table-cell",
      render: (item) => <span className="text-gray-600">{getStationName(item.stationId as string)}</span>,
    },
    {
      key: "pageCount",
      label: "Pages",
      sortable: true,
      className: "text-center",
      render: (item) => <span className="font-medium">{item.pageCount as number}</span>,
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (item) => <span className="font-medium text-gray-900">{formatCurrency(item.price as number)}</span>,
    },
    {
      key: "printStatus",
      label: "Status",
      sortable: true,
      render: (item) => (
        <StatusBadge variant={getJobStatusVariant(item.printStatus as string)}>
          {(item.printStatus as string).replace(/_/g, " ")}
        </StatusBadge>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      className: "hidden md:table-cell",
      render: (item) => (
        <span className="text-gray-500 text-xs whitespace-nowrap">{formatDateTime(item.createdAt as string)}</span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-[40px]",
      render: (item) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedJob(item as unknown as PrintJob); }}
          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Print Jobs</h3>
          <p className="text-sm text-gray-500 mt-1">{total} total jobs</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              showFilters
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                value={filters.status || ""}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All statuses</option>
                <option value="CREATED">Created</option>
                <option value="PAID">Paid</option>
                <option value="PRINTING">Printing</option>
                <option value="COMPLETED">Completed</option>
                <option value="PRINT_FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Station</label>
              <select
                value={filters.stationId || ""}
                onChange={(e) => setFilters({ ...filters, stationId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All stations</option>
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={filters.dateFrom || ""}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={filters.dateTo || ""}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear
            </button>
            <button
              onClick={applyFilters}
              className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

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
          data={jobs as unknown as Record<string, unknown>[]}
          pageSize={15}
          emptyMessage="No jobs found matching your filters."
        />
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedJob(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">Job Details</h3>
              <button onClick={() => setSelectedJob(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Job ID" value={selectedJob.jobId} mono />
                <DetailRow label="Status" value={
                  <StatusBadge variant={getJobStatusVariant(selectedJob.printStatus)}>
                    {selectedJob.printStatus.replace(/_/g, " ")}
                  </StatusBadge>
                } />
                <DetailRow label="Filename" value={selectedJob.originalFilename} />
                <DetailRow label="Station" value={getStationName(selectedJob.stationId)} />
                <DetailRow label="Pages" value={selectedJob.pageCount} />
                <DetailRow label="Copies" value={selectedJob.copies} />
                <DetailRow label="Color Mode" value={selectedJob.colorMode === "BW" ? "Black & White" : "Color"} />
                <DetailRow label="Paper Size" value={selectedJob.paperSize} />
                <DetailRow label="Duplex" value={selectedJob.duplex ? "Yes" : "No"} />
                <DetailRow label="Price" value={formatCurrency(selectedJob.price)} />
                <DetailRow label="Payment" value={
                  <StatusBadge variant={getJobStatusVariant(selectedJob.paymentStatus)}>
                    {selectedJob.paymentStatus}
                  </StatusBadge>
                } />
                <DetailRow label="Payment Ref" value={selectedJob.paymentRef || "N/A"} mono />
              </div>
              <div className="border-t border-gray-200 pt-4">
                <DetailRow label="Created" value={formatDateTime(selectedJob.createdAt)} />
                {selectedJob.startedAt && (
                  <DetailRow label="Started" value={formatDateTime(selectedJob.startedAt)} />
                )}
                {selectedJob.completedAt && (
                  <DetailRow label="Completed" value={formatDateTime(selectedJob.completedAt)} />
                )}
              </div>
              {selectedJob.errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs font-medium text-red-700 mb-1">Error</p>
                  <p className="text-sm text-red-600">{selectedJob.errorMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <span className={`text-sm text-gray-900 ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
