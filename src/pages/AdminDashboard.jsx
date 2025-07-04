import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiUsers, FiUserCheck, FiUserX, FiUserPlus, FiPlus, FiSettings, FiList } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';

const COLORS = ['#2563eb', '#10b981', '#f59e42', '#ef4444', '#fbbf24', '#a78bfa'];

const StatCard = ({ title, value, icon, color = 'blue', loading }) => {
  const Icon = icon;
  return (
    <div className={`bg-white rounded-lg shadow p-4 flex items-center border-l-4 border-${color}-500`}>
      <div className={`p-2 rounded-full bg-${color}-100 text-${color}-600 mr-4`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className={`text-2xl font-bold text-${color}-800}`}>{loading ? '...' : value}</h3>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const analyticsRes = await axiosInstance.get('/user/analytics');
        setAnalytics(analyticsRes.data);
        // Fetch logs from backend and format them for display
        const logsRes = await axiosInstance.get('/log');
        setLogs(
          (logsRes.data || []).map(log =>
            `${new Date(log.timestamp || log.createdAt).toLocaleString()} - [${log.action}] ${log.details?.userName || ''} (${log.details?.userEmail || ''}) - ${log.method} ${log.url} - IP: ${log.ip}`
          )
        );
      } catch (err) {
        console.warn('API calls failed, using mock data for development:', err.message);
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pieData = analytics?.byRole
    ? Object.entries(analytics.byRole).map(([name, value]) => ({ name, value }))
    : [];

  const statCards = [
    { title: 'Total Users', value: analytics?.totalUsers || 0, icon: FiUsers, color: 'blue' },
    { title: 'Active Users', value: analytics?.activeUsers || 0, icon: FiUserCheck, color: 'green' },
    { title: 'Inactive Users', value: analytics?.inactiveUsers || 0, icon: FiUserX, color: 'red' },
    { title: 'Recent Registrations', value: analytics?.recentRegistrations || 0, icon: FiUserPlus, color: 'purple' },
  ];

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">
        {usingMockData && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Development Mode:</strong> Using mock data. Connect to backend server for real data.
            </p>
          </div>
        )}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Link to="/register" className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
              <FiPlus className="mr-1" /> Add User
            </Link>
            {/* <Link to="/roles" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
              <FiSettings className="mr-1" /> Manage Roles
            </Link> */}
            <Link to="/logs" className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm">
              <FiList className="mr-1" /> View All Logs
            </Link>
          </div>      
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => <StatCard key={stat.title} {...stat} loading={loading} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <FiUsers className="mr-2" /> User Role Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <FiList className="mr-2" /> Logs
            </h3>
            <div className="overflow-y-auto max-h-72">
              {logs.length > 0 ? logs.map((log, idx) => (
                <div key={idx} className="text-sm text-gray-700 border-b py-1">
                  {log}
                </div>
              )) : <div className="text-gray-400">No logs found.</div>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard; 