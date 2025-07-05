import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  FiUsers, 
  FiUserCheck, 
  FiUserX, 
  FiUserPlus, 
  FiPlus, 
  FiSettings, 
  FiList,
  FiActivity,
  FiShield,
  FiClock,
  FiAlertCircle
} from 'react-icons/fi';
import Sidebar from '../components/Sidebar';

const COLORS = {
  admin: '#2563eb',
  user: '#10b981',
  moderator: '#f59e42',
  inactive: '#ef4444',
  warning: '#fbbf24',
  manager: '#a78bfa'
};

const StatCard = ({ title, value, icon, color = 'blue', loading }) => {
  const Icon = icon;
  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 border-l-4 border-${color}-500 transition-all hover:shadow-md`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600 mr-4`}>
          <Icon size={22} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className={`text-2xl font-bold text-${color}-800 mt-1`}>
            {loading ? (
              <span className="inline-block h-8 w-16 bg-gray-200 rounded animate-pulse"></span>
            ) : (
              value.toLocaleString()
            )}
          </h3>
        </div>
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
        const [analyticsRes, logsRes] = await Promise.all([
          axiosInstance.get('/user/analytics'),
          axiosInstance.get('/log?limit=15')
        ]);
        
        setAnalytics(analyticsRes.data);
        setLogs(logsRes.data || []);
        
      } catch (err) {
        console.warn('API calls failed, using mock data for development:', err.message);
        setUsingMockData(true);
        setError('Failed to load live data - using demo data');
        
        // Mock data for development
        setAnalytics({
          totalUsers: 1243,
          activeUsers: 987,
          inactiveUsers: 256,
          recentRegistrations: 42,
          byRole: {
            admin: 12,
            manager: 45,
            user: 876,
            moderator: 23
          }
        });
        
        setLogs(Array(5).fill().map((_, i) => ({
          id: i,
          action: ['login', 'user_created', 'permission_updated', 'login_failed', 'profile_updated'][i % 5],
          timestamp: new Date(Date.now() - i * 3600000).toISOString(),
          user: {
            name: ['Admin User', 'Manager One', 'Regular User', 'New User', 'Test Account'][i % 5],
            email: ['admin@example.com', 'manager@example.com', 'user@example.com', 'new@example.com', 'test@example.com'][i % 5]
          },
          ip: `192.168.1.${i+1}`,
          method: ['POST', 'GET', 'PUT', 'POST', 'GET'][i % 5],
          url: ['/auth/login', '/users', '/users/123', '/auth/login', '/profile'][i % 5]
        })));
        
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pieData = analytics?.byRole
    ? Object.entries(analytics.byRole).map(([name, value]) => ({ 
        name, 
        value,
        color: COLORS[name.toLowerCase()] || COLORS.warning 
      }))
    : [];

  const activityData = [
    { name: 'Logins', value: 342 },
    { name: 'Registrations', value: 56 },
    { name: 'Updates', value: 189 },
    { name: 'Failed Attempts', value: 23 }
  ];

  const statCards = [
    { title: 'Total Users', value: analytics?.totalUsers || 0, icon: FiUsers, color: 'blue' },
    { title: 'Active Users', value: analytics?.activeUsers || 0, icon: FiUserCheck, color: 'green' },
    { title: 'Inactive Users', value: analytics?.inactiveUsers || 0, icon: FiUserX, color: 'red' },
    { title: 'New Users (7d)', value: analytics?.recentRegistrations || 0, icon: FiUserPlus, color: 'purple' },
  ];

  const formatLogEntry = (log) => {
    const time = new Date(log.timestamp || log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = new Date(log.timestamp || log.createdAt).toLocaleDateString();
    const user = log.user?.name || log.userName || 'System';
    const action = log.action?.replace(/_/g, ' ') || 'activity';
    
    return (
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-1">
          <div className={`h-2 w-2 rounded-full ${
            log.action?.includes('failed') ? 'bg-red-500' : 'bg-green-500'
          }`}></div>
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            <span className="text-gray-500">{time}</span> {user} {action}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {log.method} {log.url} • {log.ip} • {date}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 overflow-hidden">
        {/* Alert for mock data */}
        {usingMockData && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Development Mode:</strong> Using demonstration data. Connect to backend for real analytics.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Overview of system users and activity</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <Link 
              to="/register" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiPlus className="mr-2" /> Add User
            </Link>
            <Link 
              to="/logs" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiList className="mr-2" /> View Logs
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <StatCard 
              key={stat.title} 
              title={stat.title} 
              value={stat.value} 
              icon={stat.icon} 
              color={stat.color} 
              loading={loading} 
            />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Role Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center">
                <FiUsers className="mr-2 text-blue-500" /> User Roles
              </h3>
              <Link 
                to="/users" 
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View All
              </Link>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} users`, 'Count']}
                    labelFormatter={(name) => `Role: ${name}`}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    formatter={(value) => <span className="text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Overview */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center">
                <FiActivity className="mr-2 text-green-500" /> Activity Overview
              </h3>
              <span className="text-sm text-gray-500">Last 7 days</span>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    name="Activity Count" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center">
              <FiClock className="mr-2 text-purple-500" /> Recent Activity
            </h3>
            <Link 
              to="/logs" 
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View All Activity
            </Link>
          </div>
          <div className="space-y-4">
            {logs.length > 0 ? (
              logs.slice(0, 5).map((log) => (
                <div 
                  key={log.id || log._id} 
                  className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {formatLogEntry(log)}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <FiActivity className="mx-auto h-8 w-8 mb-2" />
                <p>No recent activity found</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;