import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import Sidebar from '../components/Sidebar';
import { FiUser, FiMail, FiShield, FiCheckCircle, FiXCircle, FiPlus, FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get('/user/admins');
        setAdmins(Array.isArray(res.data) ? res.data : res.data.users || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load admins');
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  const filteredAdmins = admins.filter(admin => 
    admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { 
      key: 'name', 
      title: 'Name', 
      render: (val, row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
            <FiUser className="h-4 w-4" />
          </div>
          <span>{val || 'Unknown'}</span>
        </div>
      ) 
    },
    { 
      key: 'email', 
      title: 'Email',
      render: (val) => (
        <div className="flex items-center">
          <FiMail className="text-gray-400 mr-2 h-4 w-4" />
          <span>{val || '-'}</span>
        </div>
      )
    },
    { 
      key: 'roles', 
      title: 'Role', 
      render: (val) => (
        <div className="flex items-center">
          <FiShield className="text-gray-400 mr-2 h-4 w-4" />
          <span className="capitalize bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {Array.isArray(val) ? val.join(', ') : val || 'admin'}
          </span>
        </div>
      ) 
    },
    { 
      key: 'active', 
      title: 'Status', 
      render: (val) => (
        <div className="flex items-center">
          {val ? (
            <>
              <FiCheckCircle className="text-green-500 mr-2 h-4 w-4" />
              <span className="text-green-600">Active</span>
            </>
          ) : (
            <>
              <FiXCircle className="text-red-500 mr-2 h-4 w-4" />
              <span className="text-red-500">Inactive</span>
            </>
          )}
        </div>
      ) 
    },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 overflow-hidden">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 max-w-6xl mx-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-2xl font-bold text-gray-800">Admin Management</h2>
                <p className="text-gray-600">View and manage system administrators</p>
              </div>
              <div className="flex space-x-3">
                <Link 
                  to="/register" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiPlus className="mr-2" /> Add Admin
                </Link>
              </div>
            </div>
          </div>

          {/* Search and Error */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search admins..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                  {error}
                </div>
              )}
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? 'No matching admins found' : 'No admins available'}
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr 
                      key={admin._id || admin.id} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {columns.map((col) => (
                        <td 
                          key={col.key}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          {col.render ? col.render(admin[col.key], admin) : admin[col.key] ?? '-'}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-right">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{filteredAdmins.length}</span> of{' '}
              <span className="font-medium">{admins.length}</span> admins
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminList; 