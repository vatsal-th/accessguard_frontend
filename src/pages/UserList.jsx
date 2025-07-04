import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import Sidebar from '../components/Sidebar';
import Table from '../components/Table';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const ALL_PERMISSIONS = [
  'can_edit_users',
  'can_view_reports',
  'can_delete_users',
  // ...add all your permissions here
];

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get('/user');
        setUsers(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'email', title: 'Email' },
    { key: 'roles', title: 'Role', render: (val) => <span className="capitalize">{Array.isArray(val) ? val.join(', ') : val}</span> },
    { key: 'permissions', title: 'Permissions', render: (val, row) => (
      Array.isArray(row.roles) && row.roles.includes('admin')
        ? ALL_PERMISSIONS.map((perm, idx) => (
            <span
              key={idx}
              className="inline-block bg-gray-200 text-gray-700 rounded px-2 py-0.5 text-xs mr-1 mb-1"
            >
              {perm}
            </span>
          ))
        : Array.isArray(val) && val.length > 0
          ? val.map((perm, idx) => (
              <span
                key={idx}
                className="inline-block bg-gray-200 text-gray-700 rounded px-2 py-0.5 text-xs mr-1 mb-1"
              >
                {perm}
              </span>
            ))
          : <span className="text-gray-400">-</span>
    ) },
    { key: 'active', title: 'Status', render: (val) => val ? <span className="text-green-600">Active</span> : <span className="text-red-500">Inactive</span> },
  ];

  const handleView = (user) => {
    navigate(`/users/${user._id || user.id}`);
  };

  const filteredUsers = users.filter(
    user =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const paginatedUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 px-6 py-10">
        <div className="bg-white rounded-xl shadow-md p-6 max-w-6xl mx-auto border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">User Management</h2>
            {/* You can add a "New User" button here later if needed */}
          </div>

          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mb-4 px-4 py-2 border rounded w-full max-w-xs"
          />

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-sm text-left border border-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">
                      {col.title}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="text-center py-8 text-gray-500">
                      Loading users...
                    </td>
                  </tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="text-center py-8 text-gray-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-t hover:bg-gray-50 transition-colors"
                    >
                      {columns.map((col) => (
                        <td key={col.key} className="px-4 py-3 align-top whitespace-nowrap">
                          {col.render
                            ? col.render(user[col.key], user)
                            : user[col.key] ?? '-'}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <Button size="sm" onClick={() => handleView(user)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-center mt-4 space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border bg-gray-100 disabled:opacity-50"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, idx) => (
              <button
                key={idx + 1}
                onClick={() => setCurrentPage(idx + 1)}
                className={`px-3 py-1 rounded border ${currentPage === idx + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserList; 