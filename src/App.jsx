import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import UserList from './pages/UserList';
import UserDetail from './pages/UserDetail';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import AllLogs from './pages/AllLogs';
import AdminList from './pages/AdminList';
import ManagerList from './pages/ManagerList';
import ManagerTeam from './pages/ManagerTeam';
import EmployeeList from './pages/EmployeeList';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import UserDashboard from './pages/UserDashboard';

// Placeholder components
const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="bg-white p-8 rounded shadow text-center">
      <h1 className="text-2xl font-bold mb-2 text-red-600">Unauthorized</h1>
      <p>You do not have permission to view this page.</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>
            <Route path="/register" element={<Register />} /> 
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admindashboard" element={<AdminDashboard />} />
            <Route path="/managerdashboard" element={<ManagerDashboard />} />
            <Route path="/userdashboard" element={<UserDashboard />} />
          </Route>
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/users" element={<UserList />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="/logs" element={<AllLogs />} />
            <Route path="/user/admins" element={<AdminList />} />
            <Route path="/user/managers" element={<ManagerList />} />
            <Route path="/user/employees" element={<EmployeeList />} />
          </Route>
            <Route path="/user/managers/:managerId/team" element={<ManagerTeam />} />

          {/* Unauthorized */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
