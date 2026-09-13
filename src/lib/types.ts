export interface Station {
  id: string;
  stationCode: string;
  name: string;
  location: string;
  isActive: boolean;
  agentId?: string;
  hostname?: string;
  platform?: string;
  createdAt: string;
  updatedAt: string;
  printers?: Printer[];
  jobs?: PrintJob[];
}

export interface Printer {
  id: string;
  name: string;
  stationId: string;
  station?: Station;
  printerUri: string;
  adapterType: "WINDOWS" | "CUPS" | "IPP" | "VIRTUAL";
  isOnline: boolean;
  currentState: "IDLE" | "PRINTING" | "PAUSED" | "ERROR" | "OFFLINE";
  paperStatus: "UNKNOWN" | "OK" | "LOW" | "EMPTY";
  paperLevel: number | null;
  tonerStatus: "UNKNOWN" | "OK" | "LOW" | "EMPTY";
  tonerLevel: number | null;
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PrintJobStatus =
  | "CREATED"
  | "FILE_UPLOADED"
  | "PRICE_CALCULATED"
  | "AWAITING_PAYMENT"
  | "PAYMENT_PROCESSING"
  | "PAID"
  | "AUTHORIZED"
  | "QUEUED"
  | "PRINTING"
  | "COMPLETED"
  | "PRINT_FAILED"
  | "PRINTER_OFFLINE"
  | "PRINTER_ERROR"
  | "CANCELLED"
  | "REFUND_PENDING"
  | "REFUNDED";

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED";

export interface PrintJob {
  id: string;
  jobId: string;
  stationId: string;
  station?: Station;
  printerId: string | null;
  printer?: Printer;
  fileId: string;
  originalFilename: string;
  pageCount: number;
  pageRange: string | null;
  copies: number;
  colorMode: "BW" | "COLOR";
  paperSize: "A3" | "A4" | "A5" | "LETTER";
  duplex: boolean;
  price: number;
  currency: string;
  paymentStatus: PaymentStatus;
  authorizationStatus: "PENDING" | "AUTHORIZED" | "REJECTED";
  printStatus: PrintJobStatus;
  errorMessage: string | null;
  paymentRef: string | null;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export type AlertType =
  | "printer_offline"
  | "paper_low"
  | "paper_empty"
  | "toner_low"
  | "printer_error"
  | "failed_print"
  | "agent_disconnected";

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  stationId?: string;
  stationName?: string;
  printerId?: string;
  printerName?: string;
  severity: "info" | "warning" | "error" | "critical";
  acknowledged: boolean;
  createdAt: string;
}

export interface DashboardData {
  todayJobs: number;
  todayPages: number;
  todayRevenue: number;
  activePrinters: number;
  failedJobs: number;
  recentJobs: PrintJob[];
  revenueChart: { date: string; revenue: number }[];
  stationCount: number;
  printerCount: number;
}

export interface RevenueData {
  totalRevenue: number;
  totalTransactions: number;
  revenueByDay: { date: string; revenue: number; transactions: number }[];
  revenueByStation: { stationId: string; stationName: string; revenue: number; jobs: number }[];
}

export interface LoginResponse {
  token: string;
  user: { id: string; username: string; role: string };
}

export interface JobFilters {
  status?: string;
  stationId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
