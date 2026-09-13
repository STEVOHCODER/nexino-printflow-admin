import type {
  DashboardData,
  JobFilters,
  PaginatedResponse,
  Printer,
  PrintJob,
  RevenueData,
  Station,
  LoginResponse,
  Alert,
} from "./types";

const BASE = "/api/admin";

function getHeaders(): HeadersInit {
  const token = localStorage.getItem("admin_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: getHeaders(),
    ...options,
  });
  if (res.status === 401) {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || body.message || `Request failed: ${res.status}`);
  }
  const json = await res.json();
  return json.data ?? json;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  return request(`${BASE}/login`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function getDashboard(): Promise<DashboardData> {
  return request(`${BASE}/dashboard`);
}

export async function getJobs(filters: JobFilters = {}): Promise<PaginatedResponse<PrintJob>> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.stationId) params.set("stationId", filters.stationId);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  const res = await fetch(`${BASE}/jobs${qs ? `?${qs}` : ""}`, { headers: getHeaders() });
  if (res.status === 401) {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  const json = await res.json();
  return {
    data: json.data ?? [],
    total: json.pagination?.total ?? 0,
    page: json.pagination?.page ?? 1,
    limit: json.pagination?.limit ?? 20,
    totalPages: json.pagination?.totalPages ?? 1,
  };
}

export async function getPrinters(): Promise<Printer[]> {
  const res = await fetch(`${BASE}/printers`, { headers: getHeaders() });
  const json = await res.json();
  return json.data ?? [];
}

export async function getStations(): Promise<Station[]> {
  const res = await fetch(`${BASE}/stations`, { headers: getHeaders() });
  const json = await res.json();
  return json.data ?? [];
}

export async function getRevenue(period: string = "month"): Promise<RevenueData> {
  const daysMap: Record<string, number> = { today: 1, week: 7, month: 30, year: 365 };
  const days = daysMap[period] || 30;
  return request(`${BASE}/revenue?days=${days}`);
}

export async function getAlerts(): Promise<Alert[]> {
  return request(`${BASE}/alerts`);
}

export async function acknowledgeAlert(id: string): Promise<void> {
  await request(`${BASE}/alerts/${id}/acknowledge`, { method: "POST" });
}

export async function dismissAlert(id: string): Promise<void> {
  await request(`${BASE}/alerts/${id}`, { method: "DELETE" });
}

export async function createStation(data: {
  name: string;
  location: string;
  stationCode?: string;
}): Promise<Station> {
  return request(`/api/stations`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateStation(
  id: string,
  data: Partial<{ name: string; location: string; isActive: boolean }>
): Promise<Station> {
  return request(`/api/stations/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function createPrinter(data: {
  name: string;
  stationId: string;
  printerUri: string;
  adapterType?: string;
}): Promise<Printer> {
  return request(`/api/printers`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePrinter(
  id: string,
  data: Partial<{ name: string; printerUri: string; isOnline: boolean }>
): Promise<Printer> {
  return request(`/api/printers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteStation(id: string): Promise<void> {
  await request(`/api/stations/${id}`, { method: "DELETE" });
}

export async function deletePrinter(id: string): Promise<void> {
  await request(`/api/printers/${id}`, { method: "DELETE" });
}
