import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import MainLayout from "./shared/components/MainLayout";
import OperationalDashboard from "./features/dashboard/pages/OperationalDashboard";
import RiskIntelligence from "./features/analytics/pages/RiskIntelligence";
import TransactionAnalysis from "./features/transactions/pages/TransactionAnalysis";
import ProtectedRoute from "./features/auth/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        Component: OperationalDashboard,
      },
      {
        path: "risk-intelligence",
        Component: RiskIntelligence,
      },
      {
        path: "transaction-analysis",
        Component: TransactionAnalysis,
      },
    ],
  },
]);
