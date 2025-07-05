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
  FiPlus,
  FiChevronRight
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
    const colorClasses = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-500',
        textValue: 'text-blue-800'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-500',
        textValue: 'text-green-800'
      },
      red: {
        bg: 'bg-red-100',
        text: 'text-red-600',
        border: 'border-red-500',
        textValue: 'text-red-800'
      },
      indigo: {
        bg: 'bg-indigo-100',
        text: 'text-indigo-600',
        border: 'border-indigo-500',
        textValue: 'text-indigo-800'
      }
    };
    
    return (
      <div className={`bg-white rounded-lg shadow p-6 flex items-center border-l-4 ${colorClasses[color].border} transition-all hover:shadow-md`}>
        <div className={`p-3 rounded-full ${colorClasses[color].bg} ${colorClasses[color].text} mr-4`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className={`text-2xl font-bold ${colorClasses[color].textValue}`}>{value}</h3>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading manager team...</p>
          </div>
        </div>
      </main>
    </div>
  );

  if (error) return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="text-center py-12">
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
      <main className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm shadow-sm"
            >
              <FiArrowLeft className="mr-2" /> Back
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Manager Team</h1>
              <p className="text-gray-600 flex items-center">
                <FiChevronRight className="mx-1 text-gray-400" />
                Team members managed by <span className="font-medium ml-1 text-indigo-600">{manager?.name}</span>
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button 
              onClick={() => navigate('/user/employees')}
              className="inline-flex items-center"
              variant="primary"
            >
              <FiPlus className="mr-2" />
              Add Team Member
            </Button>
          )}
        </div>

        {/* Manager Info Card */}
        {manager && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FiShield className="mr-3 text-indigo-600" />
                Manager Information
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${manager.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {manager.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FiUser className="text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Name</p>
                    <p className="font-medium text-gray-900">{manager.name}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FiMail className="text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                    <p className="font-medium text-gray-900">{manager.email}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FiShield className="text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Role</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {Array.isArray(manager.roles) ? manager.roles.join(', ') : manager.roles}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FiCalendar className="text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Member Since</p>
                    <p className="font-medium text-gray-900">
                      {manager.createdAt ? new Date(manager.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Team Members" 
            value={stats.totalMembers} 
            icon={FiUsers} 
            color="indigo" 
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
          <StatCard 
            title="Manager Since" 
            value={manager?.createdAt ? new Date(manager.createdAt).toLocaleDateString() : 'N/A'} 
            icon={FiCalendar} 
            color="blue" 
          />
        </div>

        {/* Team Members Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center mb-3 sm:mb-0">
              <FiUsers className="text-indigo-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">
                Team Members <span className="text-gray-500 font-normal">({teamMembers.length})</span>
              </h3>
            </div>
            {teamMembers.length > 0 && (
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">1-{teamMembers.length}</span> of <span className="font-medium">{teamMembers.length}</span> members
              </div>
            )}
          </div>
          
          {teamMembers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto max-w-md">
                <FiUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No team members found</h3>
                <p className="text-gray-500 mb-6">This manager doesn't have any team members assigned yet.</p>
                {isAdmin && (
                  <Button 
                    onClick={() => navigate('/user/employees')}
                    variant="primary"
                  >
                    <FiPlus className="mr-2" />
                    Add Team Members
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teamMembers.map((member) => (
                    <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <FiUser className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {Array.isArray(member.roles) ? member.roles.join(', ') : member.roles}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FiUserCheck className="mr-1.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <FiUserX className="mr-1.5" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {/* <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/user/${member._id}`)}
                            title="View Profile"
                          >
                            View
                          </Button> */}
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManagerTeam;