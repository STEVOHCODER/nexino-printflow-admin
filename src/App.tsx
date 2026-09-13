import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import StationsPage from "./pages/StationsPage";
import PrintersPage from "./pages/PrintersPage";
import JobsPage from "./pages/JobsPage";
import PricingPage from "./pages/PricingPage";
import RevenuePage from "./pages/RevenuePage";
import AlertsPage from "./pages/AlertsPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("admin_token");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/stations" element={<StationsPage />} />
                <Route path="/printers" element={<PrintersPage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/revenue" element={<RevenuePage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
