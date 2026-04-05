import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import MainLayout from "./shared/MainLayout";
import Dashboard from "./features/dashboard/pages/Dashboard";
import DataVisualization from "./features/analytics/pages/DataVisualization";
import TransactionCreation from "./features/transactions/pages/TransactionCreation";
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
        Component: Dashboard,
      },
      {
        path: "data-visualization",
        Component: DataVisualization,
      },
      {
        path: "transaction-creation",
        Component: TransactionCreation,
      },
    ],
  },
]);
