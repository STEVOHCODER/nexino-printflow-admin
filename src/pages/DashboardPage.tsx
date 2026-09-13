import { useState, useEffect } from "react";
import {
  FileText,
  Printer,
  DollarSign,
  AlertTriangle,
  XCircle,
  TrendingUp,
  MapPin,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatsCard from "../components/StatsCard";
import StatusBadge, { getJobStatusVariant } from "../components/StatusBadge";
import { getDashboard } from "../lib/api";
import { formatCurrency, formatDateTime } from "../components/dateUtils";
import type { DashboardData } from "../lib/types";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await getDashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
        Error loading dashboard: {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
        <StatsCard
          icon={<FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />}
          label="Today's Jobs"
          value={data.todayJobs}
          color="bg-blue-50 text-blue-600"
        />
        <StatsCard
          icon={<FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />}
          label="Today's Pages"
          value={data.todayPages}
          color="bg-indigo-50 text-indigo-600"
        />
        <StatsCard
          icon={<DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />}
          label="Revenue"
          value={formatCurrency(data.todayRevenue)}
          color="bg-green-50 text-green-600"
        />
        <StatsCard
          icon={<Printer className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />}
          label="Printers"
          value={data.activePrinters}
          color="bg-purple-50 text-purple-600"
        />
        <StatsCard
          icon={<XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />}
          label="Failed"
          value={data.failedJobs}
          color="bg-red-50 text-red-600"
        />
        <StatsCard
          icon={<MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600" />}
          label="Stations"
          value={data.stationCount}
          color="bg-cyan-50 text-cyan-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 p-4 lg:p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">Revenue (Last 7 Days)</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <TrendingUp className="w-4 h-4" />
              Daily
            </div>
          </div>
          <div className="h-64 lg:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { weekday: "short" })}
                />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                  labelFormatter={(v) => new Date(v).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                  }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 overflow-hidden">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Recent Jobs</h3>
          <div className="space-y-2.5">
            {data.recentJobs.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No recent jobs</p>
            ) : (
              data.recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {job.originalFilename}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {job.pageCount} page{job.pageCount !== 1 ? "s" : ""} &middot; {formatCurrency(job.price)}
                    </p>
                  </div>
                  <StatusBadge variant={getJobStatusVariant(job.printStatus)}>
                    {job.printStatus.replace(/_/g, " ")}
                  </StatusBadge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
