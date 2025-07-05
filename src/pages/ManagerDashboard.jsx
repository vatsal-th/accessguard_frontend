import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import { 
  FiUsers, 
  FiUserCheck, 
  FiBarChart2, 
  FiEdit2, 
  FiTrash2, 
  FiUserX,
  FiUserPlus,
  FiActivity,
  FiShield,
  FiClock,
  FiSearch
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon, color = 'blue', loading }) => {
  const Icon = icon;
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 border-blue-500',
    green: 'bg-green-100 text-green-600 border-green-500',
    purple: 'bg-purple-100 text-purple-600 border-purple-500',
    orange: 'bg-orange-100 text-orange-600 border-orange-500'
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${colorClasses[color]} transition-all hover:shadow-md`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color].split(' ')[0]} mr-4`}>
          <Icon size={22} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className={`text-2xl font-bold mt-1 ${loading ? 'h-8 w-16 bg-gray-200 rounded animate-pulse' : ''}`}>
            {!loading && value.toLocaleString()}
          </h3>
        </div>
      </div>
    </div>
  );
};

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [teamStats, setTeamStats] = useState(null);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editModal, setEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', active: true });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [statsRes, teamRes] = await Promise.all([
          axiosInstance.get('/user/manager-stats'),
          axiosInstance.get('/user/my-team')
        ]);
        setTeamStats(statsRes.data);
        setTeam(Array.isArray(teamRes.data.team) ? teamRes.data.team : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredTeam = team.filter(member => 
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEditModal = (user) => {
    setEditUser(user);
    setEditForm({ 
      name: user.name, 
      email: user.email, 
      active: user.active 
    });
    setEditError('');
    setEditModal(true);
  };

  const handleEditSubmit = async () => {
    setEditLoading(true);
    setEditError('');
    try {
      await axiosInstance.put(`/user/${editUser._id}`, {
        name: editForm.name,
        email: editForm.email,
        active: editForm.active
      });
      setTeam(prev => prev.map(u => 
        u._id === editUser._id ? { 
          ...u, 
          name: editForm.name, 
          email: editForm.email, 
          active: editForm.active 
        } : u
      ));
      setEditModal(false);
    } catch (err) {
      setEditError(err?.response?.data?.message || 'Failed to update user');
    } finally {
      setEditLoading(false);
    }
  };

  const handleRemoveFromTeam = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member from your team?')) return;
    try {
      await axiosInstance.put(`/user/${userId}/assign-manager`, { managerId: null });
      setTeam(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to remove team member');
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const endpoint = currentStatus ? 'deactivate' : 'activate';
      await axiosInstance.patch(`/user/${userId}/${endpoint}`);
      setTeam(prev => prev.map(u => 
        u._id === userId ? { ...u, active: !currentStatus } : u
      ));
    } catch (err) {
      alert(err?.response?.data?.message || `Failed to ${currentStatus ? 'deactivate' : 'activate'} user`);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 w-full max-w-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Dashboard</h1>
            <p className="text-gray-600">Manage your team members and view activity</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Team Members" 
            value={teamStats?.teamMemberCount || 0} 
            icon={FiUsers} 
            color="blue" 
            loading={loading}
          />
          <StatCard 
            title="Active Members" 
            value={teamStats?.activeTeamMembers || 0} 
            icon={FiUserCheck} 
            color="green" 
            loading={loading}
          />
          <StatCard 
            title="Recent Activity" 
            value={teamStats?.recentTeamLogins || 0} 
            icon={FiActivity} 
            color="purple" 
            loading={loading}
          />
          <StatCard 
            title="Tasks Completed" 
            value={teamStats?.completedTasks || 0} 
            icon={FiBarChart2} 
            color="orange" 
            loading={loading}
          />
        </div>

        {/* Team Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-semibold flex items-center">
              <FiUsers className="mr-2 text-blue-500" /> Team Members
            </h3>
            <div className="mt-2 md:mt-0 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search team members..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th> */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTeam.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? 'No matching team members found' : 'No team members available'}
                    </td>
                  </tr>
                ) : (
                  filteredTeam.map((member) => (
                    <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            {member.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {Array.isArray(member.roles) ? member.roles.join(', ') : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          member.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {member.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Never'}
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openEditModal(member)}
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant={member.active ? 'secondary' : 'success'}
                            onClick={() => handleStatusToggle(member._id, member.active)}
                          >
                            {member.active ? (
                              <FiUserX className="h-4 w-4" />
                            ) : (
                              <FiUserCheck className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="danger"
                            onClick={() => handleRemoveFromTeam(member._id)}
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-right">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{filteredTeam.length}</span> of{' '}
              <span className="font-medium">{team.length}</span> members
            </p>
          </div>
        </div>

        {/* Edit Modal */}
        {editModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Edit Team Member
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      name="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      name="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      name="active"
                      value={editForm.active ? 'active' : 'inactive'}
                      onChange={(e) => setEditForm({...editForm, active: e.target.value === 'active'})}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {editError && (
                  <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{editError}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => setEditModal(false)}
                    disabled={editLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEditSubmit}
                    loading={editLoading}
                    disabled={editLoading}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManagerDashboard;