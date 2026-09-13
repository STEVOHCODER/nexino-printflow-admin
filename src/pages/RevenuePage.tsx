import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  FileText,
  Printer,
  TrendingUp,
} from "lucide-react";
import StatsCard from "../components/StatsCard";
import { getRevenue } from "../lib/api";
import { formatCurrency } from "../components/dateUtils";
import type { RevenueData } from "../lib/types";

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRevenue();
  }, [period]);

  async function loadRevenue() {
    try {
      setLoading(true);
      const res = await getRevenue(period);
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
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Revenue Reports</h3>
          <p className="text-sm text-gray-500 mt-1">Track your printing business revenue</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {["today", "week", "month"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 lg:px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                period === p
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p === "today" ? "Today" : p === "week" ? "Week" : "Month"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          icon={<DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />}
          label="Revenue"
          value={formatCurrency(data.totalRevenue || 0)}
          color="bg-green-50 text-green-600"
        />
        <StatsCard
          icon={<FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />}
          label="Transactions"
          value={data.totalTransactions || 0}
          color="bg-blue-50 text-blue-600"
        />
        <StatsCard
          icon={<Printer className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />}
          label="Stations"
          value={data.revenueByStation?.length || 0}
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900">Revenue Over Time</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <TrendingUp className="w-4 h-4" />
            Daily
          </div>
        </div>
        <div className="h-64 lg:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.revenueByDay || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                }}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), "Revenue"]}
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

      {/* Station Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Revenue by Station</h3>
        {!data.revenueByStation || data.revenueByStation.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No station data available</p>
        ) : (
          <div className="space-y-3">
            {data.revenueByStation.map((station) => {
              const maxRevenue = Math.max(...data.revenueByStation.map((s) => s.revenue));
              const percentage = maxRevenue > 0 ? (station.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={station.stationId} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-900 truncate">{station.stationName}</span>
                    <div className="flex items-center gap-3 text-sm shrink-0">
                      <span className="text-gray-500">{station.jobs} jobs</span>
                      <span className="font-medium text-gray-900">{formatCurrency(station.revenue)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
