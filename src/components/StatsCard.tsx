import { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: { value: number; positive: boolean };
  color?: string;
}

export default function StatsCard({ icon, label, value, trend, color = "bg-blue-50 text-blue-600" }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-5 animate-fade-in overflow-hidden">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 lg:w-11 lg:h-11 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trend.positive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {trend.positive ? "+" : ""}{trend.value}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-xl lg:text-2xl font-bold text-gray-900 truncate">{value}</p>
        <p className="text-xs lg:text-sm text-gray-500 mt-1 truncate">{label}</p>
      </div>
    </div>
  );
}
