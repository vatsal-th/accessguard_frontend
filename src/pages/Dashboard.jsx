import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiUserPlus, FiUserCheck, FiUserX, FiPlus, FiAlertCircle } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';

const ALL_PERMISSIONS = [
  'create_user',
  'edit_user',
  'delete_user',
  'view_reports',
  // ...add any others you use
];

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
        <h3 className={`text-2xl font-bold text-${color}-800`}>
          <AnimatePresence>
            {loading ? '...' : (
              <motion.span
                key={value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
              >
                {value}
              </motion.span>
            )}
          </AnimatePresence>
        </h3>
      </div>
    </div>
  );
};

const RoleBadge = ({ role }) => (
  <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
    role === 'admin'
      ? 'bg-blue-100 text-blue-800'
      : role === 'manager'
      ? 'bg-purple-100 text-purple-800'
      : role === 'user'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800'
  }`}>
    {role}
  </span>
);

const Dashboard = () => {
  const { user } = useAuth();
  const roles = user?.roles || [];
  const isAdmin = Array.isArray(roles) && roles.includes('admin');
  const isManager = roles.includes('manager');
  const permissions = isAdmin ? ALL_PERMISSIONS : (user?.permissions || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [teamStats, setTeamStats] = useState(null);

  // Local state for up-to-date user profile
  const [profile, setProfile] = useState(user);

  // Determine what to show based on permissions
  const canViewReports = permissions.includes('view_reports');
  const canCreateUser = permissions.includes('create_user');
  const canEditUser = permissions.includes('edit_user');
  const canDeleteUser = permissions.includes('delete_user');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        if (canViewReports) {
          const [analyticsRes, usersRes] = await Promise.all([
            axiosInstance.get('/user/analytics'),
            axiosInstance.get('/user/recent?limit=5'),
          ]);
          setAnalytics(analyticsRes.data);
          setRecentUsers(usersRes.data);
        } else if (canCreateUser) {
          // Only fetch recent users if can create user but not view reports
          const usersRes = await axiosInstance.get('/user/recent?limit=5');
          setRecentUsers(usersRes.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    if (permissions.length > 0) fetchData();
    else setLoading(false);
  }, [permissions.join(',')]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get('/user/me');
        setProfile(res.data.user);
      } catch (err) {
        // fallback to context user if fetch fails
        setProfile(user);
      }
    };
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (isManager) {
      axiosInstance.get('/user/manager-stats').then(res => setTeamStats(res.data));
    }
  }, [isManager]);

  // Pie chart data for analytics
  const pieData = analytics?.byRole
    ? Object.entries(analytics.byRole).map(([name, value]) => ({ name, value }))
    : [];

  // Stat cards for analytics
  const adminStats = [
    {
      title: 'Total Users',
      value: analytics?.totalUsers || 0,
      icon: FiUsers,
      color: 'blue',
    },
    {
      title: 'Active Users',
      value: analytics?.activeUsers || 0,
      icon: FiUserCheck,
      color: 'green',
    },
    {
      title: 'Inactive Users',
      value: analytics?.inactiveUsers || 0,
      icon: FiUserX,
      color: 'red',
    },
    {
      title: 'Recent Registrations',
      value: analytics?.recentRegistrations || 0,
      icon: FiUserPlus,
      color: 'purple',
    },
  ];

  // Handler for deleting a user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axiosInstance.delete(`/user/${userId}`);
      setRecentUsers(recentUsers.filter(u => u._id !== userId));
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user has no dashboard permissions
  if (!canViewReports && !canCreateUser && !canEditUser && !canDeleteUser) {
    // If user is a regular user or employee, show only self details
    if (roles.includes('user') || roles.includes('employee')) {
      return (
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="bg-white p-8 rounded shadow w-full max-w-lg">
              <h1 className="text-2xl font-bold mb-6 text-center">Your Profile</h1>
              <div className="mb-4">
                <div className="font-medium">Name: {profile?.name}</div>
                <div className="font-medium">Email: {profile?.email}</div>
                <div className="font-medium">Role: {Array.isArray(profile?.roles) ? profile.roles.join(', ') : profile?.roles || '-'}</div>
                <div className="font-medium">Created At: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}</div>
                <div className="font-medium">Last Login: {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Never'}</div>
              </div>
              <Link
                to="/reset-password"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                Reset Password
              </Link>
            </div>
          </main>
        </div>
      );
    }
    // Otherwise, show no permission message
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">AccessGuard Dashboard</h1>
          <p className="text-gray-600 mb-4">You do not have permission to view any dashboard features.</p>
          <div className="flex flex-wrap gap-2">
            {permissions.length > 0 && permissions.map((perm, idx) => (
              <span key={idx} className="inline-block bg-blue-100 text-blue-800 rounded px-2 py-0.5 text-xs">
                {perm}
              </span>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Manager Dashboard
  if (isManager) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6">Manager Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <StatCard title="Team Members" value={teamStats?.teamMemberCount || 0} icon={FiUsers} color="blue" />
            <StatCard title="Recent Logins" value={teamStats?.recentTeamLogins || 0} icon={FiUserCheck} color="green" />
          </div>
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="font-semibold text-lg mb-4">Role Summary</h3>
            <ul>
              {teamStats?.roleSummary &&
                Object.entries(teamStats.roleSummary).map(([role, count]) => (
                  <li key={role} className="mb-1">
                    <span className="capitalize font-medium">{role}:</span> {count}
                  </li>
                ))}
            </ul>
          </div>
          {permissions.includes('view_reports') && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-4">Reports</h3>
              {/* Render reports/analytics here */}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">AccessGuard Dashboard</h1>
            <p className="text-gray-600">Welcome back, {profile?.name}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {permissions.map((perm, idx) => (
                <span key={idx} className="inline-block bg-blue-100 text-blue-800 rounded px-2 py-0.5 text-xs">
                  {perm}
                </span>
              ))}
            </div>
          </div>
          {canCreateUser && (
            <Link to="/users/add" className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
              <FiPlus className="mr-1" /> Add User
            </Link>
          )}
        </div>

        {/* Analytics Section */}
        {canViewReports && analytics && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {adminStats.map((stat) => (
                <StatCard key={stat.title} {...stat} loading={loading} />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <FiUsers className="mr-2" /> User Roles Breakdown
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
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg flex items-center">
                    <FiUserPlus className="mr-2" /> Recent Users
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permissions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                        {canEditUser && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Edit</th>}
                        {canDeleteUser && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delete</th>}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentUsers.length > 0 ? recentUsers.map((u) => (
                        <tr key={u._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {Array.isArray(u.roles) && u.roles.length > 0
                              ? u.roles.map((role, idx) => (
                                  <RoleBadge key={idx} role={role} />
                                ))
                              : <span className="text-gray-400">-</span>
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {Array.isArray(u.permissions) && u.permissions.length > 0
                              ? u.permissions.map((perm, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block bg-gray-200 text-gray-700 rounded px-2 py-0.5 text-xs mr-1 mb-1"
                                  >
                                    {perm}
                                  </span>
                                ))
                              : <span className="text-gray-400">-</span>
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown'}</td>
                          {canEditUser && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Link to={`/users/${u._id}`} className="text-blue-600 hover:underline">Edit</Link>
                            </td>
                          )}
                          {canDeleteUser && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                className="text-red-600 hover:underline"
                                title="Delete user"
                                onClick={() => handleDeleteUser(u._id)}
                              >
                                Delete
                              </button>
                            </td>
                          )}
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5 + (canEditUser ? 1 : 0) + (canDeleteUser ? 1 : 0)} className="px-6 py-4 text-center text-gray-400">No recent users found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;