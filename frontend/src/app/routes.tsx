import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import MainLayout from "./pages/MainLayout";
import OperationalDashboard from "./pages/OperationalDashboard";
import RiskIntelligence from "./pages/RiskIntelligence";
import TransactionAnalysis from "./pages/TransactionAnalysis";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/",
    Component: MainLayout,
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
