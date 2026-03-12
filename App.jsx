import React, { useContext } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthContext } from "./context/AuthContext.jsx";

// AUTH components
import Login from "./auth/Login.jsx";
import ResetPassword from "./auth/ResetPassword.jsx";

// ADMIN PAGES
import AdminDashboard from "./pages/Admin/Dashboard.jsx";
import AdminStudents from "./pages/Admin/Students.jsx";
import AdminComplaints from "./pages/Admin/Complaints.jsx";
import AdminHostel from "./pages/Admin/Hostel.jsx";
import AdminWardens from "./pages/Admin/Wardens.jsx";
import AdminFinance from "./pages/Admin/Finance.jsx";
import AdminTransport from "./pages/Admin/Transport.jsx";
import AdminNotificationsAndAlerts from "./pages/Admin/NotificationsAndAlerts.jsx";
import AdminProfile from "./pages/Admin/Profile.jsx";
import AdminSetting from "./pages/Admin/Setting.jsx";

// WARDEN PAGES
import WardenDashboard from "./pages/Warden/Dashboard.jsx";
import WardenStudents from "./pages/Warden/Students.jsx";
import WardenAttendance from "./pages/Warden/Attendance.jsx";
import WardenRooms from "./pages/Warden/Rooms.jsx";
import WardenNotificationsAndAlerts from "./pages/Warden/NotificationsAndAlerts.jsx";
import WardenProfile from "./pages/Warden/Profile.jsx";
import AttendanceQr from "./pages/Warden/AttendanceQR.jsx";

// Protected route wrapper
function ProtectedRoute({ children, allow }) {
  const { token, role, loading } = useContext(AuthContext);

  // Wait until rehydration completes
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-600 text-sm">
        Checking session...
      </div>
    );
  }

  // No token = not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Role not allowed
  if (allow && !allow.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ResetPassword />} />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AdminStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/complaints"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AdminComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/hostel"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AdminHostel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/wardens"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AdminWardens />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/finance"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AdminFinance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/transport"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AdminTransport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications-alerts"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AdminNotificationsAndAlerts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AdminProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AdminSetting />
            </ProtectedRoute>
          }
        />

        {/* WARDEN ROUTES */}
        <Route
          path="/warden"
          element={
            <ProtectedRoute allow={["warden"]}>
              <WardenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/students"
          element={
            <ProtectedRoute allow={["warden"]}>
              <WardenStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/attendance"
          element={
            <ProtectedRoute allow={["warden"]}>
              <WardenAttendance />
            </ProtectedRoute>
          }
        />
         <Route
          path="/warden/attendanceqr"
          element={
            <ProtectedRoute allow={["warden"]}>
              <AttendanceQr />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/rooms"
          element={
            <ProtectedRoute allow={["warden"]}>
              <WardenRooms />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/notifications-alerts"
          element={
            <ProtectedRoute allow={["warden"]}>
              <WardenNotificationsAndAlerts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warden/profile"
          element={
            <ProtectedRoute allow={["warden"]}>
              <WardenProfile />
            </ProtectedRoute>
          }
        />

        {/* DEFAULT REDIRECTS */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
