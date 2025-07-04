import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import { FiUsers, FiUserCheck, FiBarChart2, FiEdit2, FiTrash2, FiUserX } from 'react-icons/fi';

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
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editModal, setEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', active: true });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const statsRes = await axiosInstance.get('/user/manager-stats');
        setTeamStats(statsRes.data);
        // Fetch team members (users managed by this manager)
        const teamRes = await axiosInstance.get('/user/my-team');
        setTeam(Array.isArray(teamRes.data.team) ? teamRes.data.team : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load manager dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const openEditModal = (user) => {
    setEditUser(user);
    setEditForm({ name: user.name, email: user.email, active: user.active });
    setEditError('');
    setEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === 'active' ? value === 'active' : value,
    }));
  };

  const handleEditSubmit = async () => {
    setEditLoading(true);
    setEditError('');
    try {
      const payload = {
        name: editForm.name,
        email: editForm.email,
        active: !!editForm.active,
      };
      console.log('Updating user with payload:', payload);
      await axiosInstance.put(`/user/${editUser._id}`, payload);
      setTeam(prev => prev.map(u => u._id === editUser._id ? { ...u, name: editForm.name, email: editForm.email, active: !!editForm.active } : u));
      setEditModal(false);
    } catch (err) {
      setEditError(err?.response?.data?.message || 'Failed to update user');
    } finally {
      setEditLoading(false);
    }
  };

  const handleRemoveFromTeam = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user from your team?')) return;
    try {
      await axiosInstance.put(`/user/${userId}/assign-manager`, { managerId: null });
      setTeam(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to remove user from team');
    }
  };

  const handleDeactivate = async (userId) => {
    try {
      await axiosInstance.patch(`/user/${userId}/deactivate`, { active: false });
      setTeam((prevTeam) =>
        prevTeam.map((member) =>
          member._id === userId ? { ...member, active: false } : member
        )
      );
    } catch (error) {
      console.error("Failed to deactivate user:", error);
      // Optionally show an error message to the user
    }
  };

  const handleActivate = async (userId) => {
    try {
      await axiosInstance.patch(`/user/${userId}/activate`, { active: true });
      setTeam((prevTeam) =>
        prevTeam.map((member) =>
          member._id === userId ? { ...member, active: true } : member
        )
      );
    } catch (error) {
      console.error("Failed to activate user:", error);
      // Optionally show an error message to the user
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

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
          <h3 className="font-semibold text-lg mb-4">Your Team</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-sm text-left border border-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Name</th>
                  <th className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Email</th>
                  <th className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Role</th>
                  <th className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {team.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">No team members found.</td></tr>
                ) : (
                  team.map((member) => (
                    <tr key={member._id} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 align-top whitespace-nowrap">{member.name}</td>
                      <td className="px-4 py-3 align-top whitespace-nowrap">{member.email}</td>
                      <td className="px-4 py-3 align-top whitespace-nowrap">{Array.isArray(member.roles) && member.roles.length > 0 ? member.roles.join(', ') : 'N/A'}</td>
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        {member.active ? <span className="text-green-600">Active</span> : <span className="text-red-500">Inactive</span>}
                      </td>
                      <td className="px-4 py-3 align-top whitespace-nowrap flex gap-2">
                        <Button size="sm" onClick={() => openEditModal(member)}><FiEdit2 /></Button>
                        <Button size="sm" variant="danger" onClick={() => handleRemoveFromTeam(member._id)}><FiTrash2 /></Button>
                        {member.active ? (
                          <Button size="sm" variant="secondary" onClick={() => handleDeactivate(member._id)} title="Deactivate">
                            <FiUserX />
                          </Button>
                        ) : (
                          <Button size="sm" variant="secondary" onClick={() => handleActivate(member._id)} title="Activate">
                            <FiUserCheck />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {editModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Edit Team Member</h3>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">Name</label>
                <input
                  className="w-full border rounded px-3 py-2 mb-2"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                />
                <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
                <input
                  className="w-full border rounded px-3 py-2 mb-2"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                />
              </div>
              {editError && <div className="mb-2 text-red-600 text-sm">{editError}</div>}
              <div className="flex justify-end gap-2 mt-4">
                <Button onClick={() => setEditModal(false)} variant="secondary">Cancel</Button>
                <Button onClick={handleEditSubmit} loading={editLoading}>Save</Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManagerDashboard; 