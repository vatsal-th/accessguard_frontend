import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {FiUsers, FiUser, FiUserCheck, FiUserX, FiEye } from 'react-icons/fi';

const ManagerList = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedManagers, setExpandedManagers] = useState(new Set());
  const [teamMembers, setTeamMembers] = useState({});
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
        
        // If admin, fetch team members for each manager
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
    { key: 'name', title: 'Name' },
    { key: 'email', title: 'Email' },
    { key: 'roles', title: 'Role', render: (val) => <span className="capitalize">{Array.isArray(val) ? val.join(', ') : val}</span> },
    { key: 'active', title: 'Status', render: (val) => val ? <span className="text-green-600">Active</span> : <span className="text-red-500">Inactive</span> },
    ...(isAdmin ? [{ key: 'teamCount', title: 'Team Size', render: (val, manager) => {
      const team = teamMembers[manager._id] || [];
      return (
        <div className="flex items-center gap-2">
          <FiUsers className="text-blue-500" />
          <span>{team.length} members</span>
        </div>
      );
    }}] : []),
  ];

  const TeamMemberRow = ({ member, managerId }) => (
    <tr key={`${managerId}-${member._id}`} className="bg-gray-50 border-t border-gray-200">
      <td className="px-4 py-3 pl-12">
        <div className="flex items-center gap-2">
          <FiUser className="text-gray-400" />
          <span className="font-medium">{member.name}</span>
        </div>
      </td>
      <td className="px-4 py-3">{member.email}</td>
      <td className="px-4 py-3">
        <span className="capitalize">{Array.isArray(member.roles) ? member.roles.join(', ') : member.roles}</span>
      </td>
      <td className="px-4 py-3">
        {member.active ? (
          <span className="text-green-600 flex items-center gap-1">
            <FiUserCheck className="text-sm" />
            Active
          </span>
        ) : (
          <span className="text-red-500 flex items-center gap-1">
            <FiUserX className="text-sm" />
            Inactive
          </span>
        )}
      </td>
      {isAdmin && <td className="px-4 py-3">-</td>}
    </tr>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 px-6 py-10">
        <div className="bg-white rounded-xl shadow-md p-6 max-w-6xl mx-auto border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Manager List</h2>
            {isAdmin && (
              <div className="text-sm text-gray-600">
                Click on a manager to view their team members
              </div>
            )}
          </div>
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-sm text-left border border-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">{col.title}</th>
                  ))}
                  {isAdmin && <th className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={columns.length + (isAdmin ? 1 : 0)} className="text-center py-8 text-gray-500">Loading managers...</td></tr>
                ) : managers.length === 0 ? (
                  <tr><td colSpan={columns.length + (isAdmin ? 1 : 0)} className="text-center py-8 text-gray-400">No managers found.</td></tr>
                ) : (
                  managers.map((manager) => {
                    const isExpanded = expandedManagers.has(manager._id);
                    const team = teamMembers[manager._id] || [];
                    
                    return (
                      <React.Fragment key={manager._id}>
                        <tr className="border-t hover:bg-gray-50 transition-colors">
                          {columns.map((col) => (
                            <td key={col.key} className="px-4 py-3 align-top whitespace-nowrap">
                              {col.render ? col.render(manager[col.key], manager) : manager[col.key] ?? '-'}
                            </td>
                          ))}
                          {isAdmin && (
                            <td className="px-4 py-3">
                              <div className="flex gap-2">

                                <Button 
                                  size="sm" 
                                  variant="primary"
                                  onClick={() => navigate(`/user/managers/${manager._id}/team`)}
                                  className="flex items-center gap-1"
                                  title="View Detailed Team"
                                >
                                  <FiEye />
                                  View Team
                                </Button>
                              </div>
                            </td>
                          )}
                        </tr>
                        {isAdmin && isExpanded && team.length > 0 && (
                          <>
                            <tr className="bg-blue-50">
                              <td colSpan={columns.length + 1} className="px-4 py-2">
                                <div className="flex items-center gap-2 text-blue-700 font-medium">
                                  <FiUsers />
                                  Team Members ({team.length})
                                </div>
                              </td>
                            </tr>
                            {team.map((member) => (
                              <TeamMemberRow key={member._id} member={member} managerId={manager._id} />
                            ))}
                          </>
                        )}
                        {isAdmin && isExpanded && team.length === 0 && (
                          <tr className="bg-gray-50">
                            <td colSpan={columns.length + 1} className="px-4 py-3 pl-12 text-gray-500">
                              No team members assigned
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManagerList; 