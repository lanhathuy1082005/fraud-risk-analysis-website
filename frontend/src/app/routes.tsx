import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MainLayout from "./pages/MainLayout";
import OperationalDashboard from "./pages/OperationalDashboard";
import RiskIntelligence from "./pages/RiskIntelligence";
import TransactionAnalysis from "./pages/TransactionAnalysis";
import ProtectedRoute from "./auth/ProtectedRoute";

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
