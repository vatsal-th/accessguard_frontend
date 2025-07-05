import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, 
  FiUser, 
  FiUserCheck, 
  FiUserX, 
  FiEye,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiSearch,
  FiBriefcase
} from 'react-icons/fi';

const ManagerList = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedManagers, setExpandedManagers] = useState(new Set());
  const [teamMembers, setTeamMembers] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const isAdmin = Array.isArray(user?.roles) && user.roles.includes('admin');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchManagers = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get('/user/managers');
        const managersData = Array.isArray(res.data) ? res.data : res.data.users || [];
        setManagers(managersData);
        
        if (isAdmin) {
          const teamData = {};
          for (const manager of managersData) {
            try {
              const teamRes = await axiosInstance.get(`/user/${manager._id}/team`);
              teamData[manager._id] = teamRes.data || [];
            } catch (err) {
              console.warn(`Failed to fetch team for manager ${manager._id}:`, err);
              teamData[manager._id] = [];
            }
          }
          setTeamMembers(teamData);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load managers');
      } finally {
        setLoading(false);
      }
    };
    fetchManagers();
  }, [isAdmin]);

  const filteredManagers = managers.filter(manager => 
    manager.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    manager.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpanded = (managerId) => {
    setExpandedManagers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(managerId)) {
        newSet.delete(managerId);
      } else {
        newSet.add(managerId);
      }
      return newSet;
    });
  };

  const columns = [
    { 
      key: 'name', 
      title: 'Manager', 
      render: (val, manager) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            {val?.charAt(0).toUpperCase() || 'M'}
          </div>
          <div>
            <div className="font-medium">{val || 'Unknown'}</div>
            <div className="text-xs text-gray-500">{manager.email}</div>
          </div>
        </div>
      ) 
    },
    { 
      key: 'roles', 
      title: 'Role', 
      render: (val) => (
        <div className="flex items-center gap-2">
          <FiBriefcase className="text-gray-400" />
          <span className="capitalize bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
            {Array.isArray(val) ? val.join(', ') : val || 'manager'}
          </span>
        </div>
      ) 
    },
    { 
      key: 'active', 
      title: 'Status', 
      render: (val) => (
        <div className="flex items-center gap-2">
          {val ? (
            <>
              <FiUserCheck className="text-green-500" />
              <span className="text-green-600">Active</span>
            </>
          ) : (
            <>
              <FiUserX className="text-red-500" />
              <span className="text-red-500">Inactive</span>
            </>
          )}
        </div>
      ) 
    },
    ...(isAdmin ? [{ 
      key: 'teamCount', 
      title: 'Team', 
      render: (val, manager) => {
        const team = teamMembers[manager._id] || [];
        return (
          <div className="flex items-center gap-2">
            <FiUsers className="text-blue-500 " />
            <span className="capitalize">{team.length} member{team.length !== 1 ? 's' : ''}</span>
          </div>
        );
      }
    }] : []),
  ];

  const TeamMemberRow = ({ member, managerId }) => (
    <tr key={`${managerId}-${member._id}`} className="bg-gray-50 hover:bg-gray-100 transition-colors">
      <td className="px-6 py-3 pl-16">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
            {member.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="font-medium">{member.name || 'Unknown'}</div>
            <div className="text-xs text-gray-500">{member.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-3">
        <div className="flex items-center gap-2">
          <FiBriefcase className="text-gray-400" />
          <span className="capitalize">{Array.isArray(member.roles) ? member.roles.join(', ') : member.roles}</span>
        </div>
      </td>
      <td className="px-6 py-3">
        {member.active ? (
          <span className="text-green-600 flex items-center gap-2">
            <FiUserCheck className="text-sm" />
            Active
          </span>
        ) : (
          <span className="text-red-500 flex items-center gap-2">
            <FiUserX className="text-sm" />
            Inactive
          </span>
        )}
      </td>
      {isAdmin && <td className="px-6 py-3">-</td>}
    </tr>
  );

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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 max-w-6xl mx-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-2xl font-bold text-gray-800">Manager Directory</h2>
                <p className="text-gray-600">
                  {isAdmin ? 'View and manage all managers and their teams' : 'View all managers'}
                </p>
              </div>
            </div>
          </div>

          {/* Search and Error */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search managers by name or email..."
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
                  {columns.map((col) => (
                    <th 
                      key={col.key}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {col.title}
                    </th>
                  ))}
                  {isAdmin && (
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredManagers.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + (isAdmin ? 1 : 0)} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? 'No matching managers found' : 'No managers available'}
                    </td>
                  </tr>
                ) : (
                  filteredManagers.map((manager) => {
                    const isExpanded = expandedManagers.has(manager._id);
                    const team = teamMembers[manager._id] || [];
                    
                    return (
                      <React.Fragment key={manager._id}>
                        <tr 
                          className={`hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-blue-50' : ''}`}
                          onClick={isAdmin ? () => toggleExpanded(manager._id) : undefined}
                          style={isAdmin ? { cursor: 'pointer' } : {}}
                        >
                          {columns.map((col) => (
                            <td 
                              key={col.key}
                              className="px-6 py-4 whitespace-nowrap"
                            >
                              {col.render ? col.render(manager[col.key], manager) : manager[col.key] ?? '-'}
                            </td>
                          ))}
                          {isAdmin && (
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/user/managers/${manager._id}/team`);
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  <FiEye className="h-4 w-4" />
                                  <span className="hidden sm:inline">View</span>
                                </Button>
                                
                              </div>
                            </td>
                          )}
                        </tr>
                        {isAdmin && isExpanded && (
                          <>
                            {team.length > 0 ? (
                              team.map((member) => (
                                <TeamMemberRow key={member._id} member={member} managerId={manager._id} />
                              ))
                            ) : (
                              <tr className="bg-gray-50">
                                <td colSpan={columns.length + 1} className="px-6 py-4 pl-16 text-gray-500">
                                  No team members assigned
                                </td>
                              </tr>
                            )}
                          </>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-right">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{filteredManagers.length}</span> of{' '}
              <span className="font-medium">{managers.length}</span> managers
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManagerList;