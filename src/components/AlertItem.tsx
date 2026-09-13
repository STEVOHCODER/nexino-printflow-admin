import { AlertTriangle, XCircle, Info, WifiOff, Printer, FileText, Server } from "lucide-react";
import type { Alert as AlertType } from "../lib/types";
import StatusBadge from "./StatusBadge";
import { formatDistanceToNow } from "./dateUtils";

interface Props {
  alert: AlertType;
  onAcknowledge?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

const severityConfig: Record<string, { bg: string; icon: React.ReactNode; badgeVariant: "danger" | "warning" | "info" }> = {
  critical: { bg: "bg-red-50 border-red-200", icon: <XCircle className="w-5 h-5 text-red-500" />, badgeVariant: "danger" },
  error: { bg: "bg-red-50 border-red-200", icon: <XCircle className="w-5 h-5 text-red-500" />, badgeVariant: "danger" },
  warning: { bg: "bg-amber-50 border-amber-200", icon: <AlertTriangle className="w-5 h-5 text-amber-500" />, badgeVariant: "warning" },
  info: { bg: "bg-blue-50 border-blue-200", icon: <Info className="w-5 h-5 text-blue-500" />, badgeVariant: "info" },
};

function getAlertIcon(type: AlertType["type"]) {
  switch (type) {
    case "printer_offline":
    case "agent_disconnected":
      return <WifiOff className="w-4 h-4 text-gray-500" />;
    case "paper_low":
    case "paper_empty":
      return <FileText className="w-4 h-4 text-gray-500" />;
    case "toner_low":
      return <Printer className="w-4 h-4 text-gray-500" />;
    case "printer_error":
      return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    case "failed_print":
      return <XCircle className="w-4 h-4 text-gray-500" />;
    default:
      return <Server className="w-4 h-4 text-gray-500" />;
  }
}

export default function AlertItem({ alert, onAcknowledge, onDismiss }: Props) {
  const config = severityConfig[alert.severity] || severityConfig.info;
  const timeAgo = formatDistanceToNow(alert.createdAt);

  return (
    <div
      className={`border rounded-lg p-4 ${config.bg} ${
        alert.acknowledged ? "opacity-60" : ""
      } animate-fade-in`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{config.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-semibold text-gray-900">{alert.title}</h4>
              <StatusBadge variant={config.badgeVariant}>
                {alert.severity}
              </StatusBadge>
              {alert.acknowledged && (
                <StatusBadge variant="neutral">acknowledged</StatusBadge>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              {getAlertIcon(alert.type)}
              <span className="capitalize">{alert.type.replace(/_/g, " ")}</span>
              {alert.stationName && <span>Station: {alert.stationName}</span>}
              {alert.printerName && <span>Printer: {alert.printerName}</span>}
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!alert.acknowledged && onAcknowledge && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Acknowledge
            </button>
          )}
          {onDismiss && (
            <button
              onClick={() => onDismiss(alert.id)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
