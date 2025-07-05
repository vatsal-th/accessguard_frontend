import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { 
  FiArrowLeft, 
  FiUsers, 
  FiUser, 
  FiUserCheck, 
  FiUserX, 
  FiMail, 
  FiCalendar,
  FiShield,
  FiEdit2,
  FiTrash2,
  FiPlus
} from 'react-icons/fi';

const ManagerTeam = () => {
  const { managerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = Array.isArray(user?.roles) && user.roles.includes('admin');
  
  const [manager, setManager] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0
  });

  useEffect(() => {
    const fetchManagerTeam = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch manager details
        const managerRes = await axiosInstance.get(`/user/${managerId}`);
        setManager(managerRes.data.user || managerRes.data);
        
        // Fetch team members
        const teamRes = await axiosInstance.get(`/user/${managerId}/team`);
        const team = teamRes.data?.team || teamRes.data || [];
        setTeamMembers(team);
        
        // Calculate stats
        const activeMembers = team.filter(member => member.active).length;
        setStats({
          totalMembers: team.length,
          activeMembers,
          inactiveMembers: team.length - activeMembers
        });
        
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load manager team');
        console.error('Error fetching manager team:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchManagerTeam();
  }, [managerId]);




  const handleRemoveFromTeam = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the team?')) return;
    try {
      await axiosInstance.put(`/user/${memberId}/assign-manager`, { managerId: null });
      setTeamMembers(prev => prev.filter(member => member._id !== memberId));
      // Update stats
      const removedMember = teamMembers.find(member => member._id === memberId);
      if (removedMember) {
        setStats(prev => ({
          totalMembers: prev.totalMembers - 1,
          activeMembers: removedMember.active ? prev.activeMembers - 1 : prev.activeMembers,
          inactiveMembers: removedMember.active ? prev.inactiveMembers : prev.inactiveMembers - 1
        }));
      }
    } catch (error) {
      console.error('Failed to remove member from team:', error);
    }
  };

  const StatCard = ({ title, value, icon, color = 'blue' }) => {
    const Icon = icon;
    return (
      <div className={`bg-white rounded-lg shadow p-4 flex items-center border-l-4 border-${color}-500`}>
        <div className={`p-2 rounded-full bg-${color}-100 text-${color}-600 mr-4`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className={`text-2xl font-bold text-${color}-800`}>{value}</h3>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading manager team...</p>
          </div>
        </div>
      </main>
    </div>
  );

  if (error) return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Team</h3>
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={() => navigate(-1)} 
              className="mt-4"
              variant="secondary"
            >
              <FiArrowLeft className="mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              <FiArrowLeft className="mr-2" /> Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Manager Team</h1>
              <p className="text-gray-600">Team members managed by {manager?.name}</p>
            </div>
          </div>
          {isAdmin && (
            <Button 
              onClick={() => navigate('/user/employees')}
              className="inline-flex items-center"
            >
              <FiPlus className="mr-2" />
              Add Team Member
            </Button>
          )}
        </div>

        {/* Manager Info Card */}
        {manager && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiShield className="mr-2 text-blue-600" />
              Manager Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center">
                <FiUser className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{manager.name}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FiMail className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{manager.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FiShield className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium capitalize">{Array.isArray(manager.roles) ? manager.roles.join(', ') : manager.roles}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FiUserCheck className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`font-medium ${manager.active ? 'text-green-600' : 'text-red-500'}`}>
                    {manager.active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard 
            title="Total Team Members" 
            value={stats.totalMembers} 
            icon={FiUsers} 
            color="blue" 
          />
          <StatCard 
            title="Active Members" 
            value={stats.activeMembers} 
            icon={FiUserCheck} 
            color="green" 
          />
          <StatCard 
            title="Inactive Members" 
            value={stats.inactiveMembers} 
            icon={FiUserX} 
            color="red" 
          />
        </div>

        {/* Team Members Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center">
              <FiUsers className="mr-2" />
              Team Members ({teamMembers.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <FiUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium">No team members found</p>
                      <p className="text-sm">This manager doesn't have any team members assigned yet.</p>
                    </td>
                  </tr>
                ) : (
                  teamMembers.map((member) => (
                    <tr key={member._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <FiUser className="h-6 w-6 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {Array.isArray(member.roles) ? member.roles.join(', ') : member.roles}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.active ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            <FiUserCheck className="mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            <FiUserX className="mr-1" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {isAdmin && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleRemoveFromTeam(member._id)}
                              title="Remove from Team"
                            >
                              <FiTrash2 />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManagerTeam; 