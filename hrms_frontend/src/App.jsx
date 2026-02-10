import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { AppStateProvider } from "./context/AppStateContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./Authentication/Components/Login";
import ForgotPassword from "./Authentication/Components/ForgotPassword"; // New Import
import RequestPasswordReset from "./Authentication/Components/RequestPasswordReset";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import CreateHR from "./pages/Admin/CreateHR";
import ManageHR from "./pages/Admin/ManageHR";
import EditHR from "./pages/Admin/EditHR";

// HR Pages
import HRDashboard from "./pages/HR/HRDashboard";
import CreateEmployee from "./pages/HR/CreateEmployee";
import ManageEmployees from "./pages/HR/ManageEmployees";
import EditEmployee from "./pages/HR/EditEmployee";
import EmployeeDocuments from "./pages/Employee/EmployeeDocuments";
import EmployeeTime from "./pages/Employee/EmployeeTime";
import HRApprovals from "./pages/HR/HRApprovals";

// Employee Pages
import EmployeeDashboard from "./pages/Employee/EmployeeDashboard";
import EmployeeProfile from "./pages/Employee/EmployeeProfile";

function App() {
  const protectedRoutes = [
    // Admin
    { path: "/admin/dashboard", element: <AdminDashboard />, roles: ["ADMIN"] },
    { path: "/admin/create-hr", element: <CreateHR />, roles: ["ADMIN"] },
    { path: "/admin/manage-hr", element: <ManageHR />, roles: ["ADMIN"] },
    { path: "/admin/manage-hr/:id/edit", element: <EditHR />, roles: ["ADMIN"] },
    // HR
    { path: "/hr/dashboard", element: <HRDashboard />, roles: ["HR"] },
    { path: "/hr/create-employee", element: <CreateEmployee />, roles: ["HR"] },
    { path: "/hr/manage-employees", element: <ManageEmployees />, roles: ["HR"] },
    { path: "/hr/manage-employees/:id/edit", element: <EditEmployee />, roles: ["HR"] },
    { path: "/hr/documents", element: <EmployeeDocuments />, roles: ["HR"] },
    { path: "/hr/time", element: <EmployeeTime />, roles: ["HR"] },
    { path: "/hr/approvals", element: <HRApprovals />, roles: ["HR"] },
    // Employee
    { path: "/employee/dashboard", element: <EmployeeDashboard />, roles: ["EMPLOYEE"] },
    { path: "/employee/profile", element: <EmployeeProfile />, roles: ["EMPLOYEE"] },
    { path: "/profile", element: <EmployeeProfile />, roles: ["ADMIN", "HR", "EMPLOYEE"] },
    { path: "/employee/documents", element: <EmployeeDocuments />, roles: ["EMPLOYEE"] },
    { path: "/employee/time", element: <EmployeeTime />, roles: ["EMPLOYEE"] },
  ];

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppStateProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/request-password" element={<RequestPasswordReset />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {protectedRoutes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      <ProtectedRoute allowedRoles={route.roles}>
                        {route.element}
                      </ProtectedRoute>
                    }
                  />
                ))}

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Router>
          </AppStateProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
