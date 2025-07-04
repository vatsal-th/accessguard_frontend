import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import { FiUsers, FiUserCheck, FiBarChart2 } from 'react-icons/fi';

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

const ManagerDashboard = () => {
  const [teamStats, setTeamStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get('/user/manager-stats');
        setTeamStats(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load manager dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="p-6">
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
      {teamStats?.canViewReports && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-4 flex items-center">
            <FiBarChart2 className="mr-2" /> Reports
          </h3>
          {/* Render reports/analytics here */}
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard; 