import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';

const ManagerList = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchManagers = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get('/user/managers');
        setManagers(Array.isArray(res.data) ? res.data : res.data.users || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load managers');
      } finally {
        setLoading(false);
      }
    };
    fetchManagers();
  }, []);

  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'email', title: 'Email' },
    { key: 'roles', title: 'Role', render: (val) => <span className="capitalize">{Array.isArray(val) ? val.join(', ') : val}</span> },
    { key: 'active', title: 'Status', render: (val) => val ? <span className="text-green-600">Active</span> : <span className="text-red-500">Inactive</span> },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 px-6 py-10">
        <div className="bg-white rounded-xl shadow-md p-6 max-w-6xl mx-auto border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Manager List</h2>
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
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={columns.length} className="text-center py-8 text-gray-500">Loading managers...</td></tr>
                ) : managers.length === 0 ? (
                  <tr><td colSpan={columns.length} className="text-center py-8 text-gray-400">No managers found.</td></tr>
                ) : (
                  managers.map((manager) => (
                    <tr key={manager._id} className="border-t hover:bg-gray-50 transition-colors">
                      {columns.map((col) => (
                        <td key={col.key} className="px-4 py-3 align-top whitespace-nowrap">
                          {col.render ? col.render(manager[col.key], manager) : manager[col.key] ?? '-'}
                        </td>
                      ))}
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

export default ManagerList; 