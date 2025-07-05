import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import { 
  FiUser, 
  FiMail, 
  FiBriefcase, 
  FiUsers, 
  FiCheckCircle, 
  FiXCircle,
  FiPlus,
  FiChevronDown,
  FiSearch
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [managers, setManagers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [employeesRes, managersRes] = await Promise.all([
          axiosInstance.get('/user/employees'),
          axiosInstance.get('/user/managers')
        ]);
        setEmployees(Array.isArray(employeesRes.data) ? employeesRes.data : employeesRes.data.users || []);
        setManagers(Array.isArray(managersRes.data) ? managersRes.data : managersRes.data.users || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredEmployees = employees.filter(employee => 
    employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAssignManagerModal = (employee) => {
    setSelectedEmployee(employee);
    setSelectedManagerId(employee.manager || '');
    setAssignError('');
    setAssignSuccess('');
    setShowModal(true);
  };

  const handleAssignManager = async () => {
    if (!selectedManagerId) {
      setAssignError('Please select a manager');
      return;
    }
    setAssignLoading(true);
    setAssignError('');
    setAssignSuccess('');
    try {
      await axiosInstance.put(`/user/${selectedEmployee._id}/assign-manager`, { 
        managerId: selectedManagerId 
      });
      setAssignSuccess('Manager assigned successfully');
      setEmployees(prev => prev.map(emp => 
        emp._id === selectedEmployee._id ? { ...emp, manager: selectedManagerId } : emp
      ));
      setTimeout(() => setShowModal(false), 1500);
    } catch (err) {
      setAssignError(err?.response?.data?.message || 'Failed to assign manager');
    } finally {
      setAssignLoading(false);
    }
  };

  const columns = [
    { 
      key: 'name', 
      title: 'Employee', 
      render: (val, row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
            <FiUser className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">{val || 'Unknown'}</div>
            <div className="text-xs text-gray-500">{row.email}</div>
          </div>
        </div>
      ) 
    },
    { 
      key: 'roles', 
      title: 'Role', 
      render: (val) => (
        <div className="flex items-center">
          <FiBriefcase className="text-gray-400 mr-2 h-4 w-4" />
          <span className="capitalize bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
            {Array.isArray(val) ? val.join(', ') : val || 'employee'}
          </span>
        </div>
      ) 
    },
    { 
      key: 'manager', 
      title: 'Manager', 
      render: (val) => {
        const manager = managers.find(m => m._id === val);
        return manager ? (
          <div className="flex items-center">
            <FiUsers className="text-gray-400 mr-2 h-4 w-4" />
            <span>{manager.name}</span>
          </div>
        ) : (
          <span className="text-gray-400">Not assigned</span>
        );
      }
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
                <h2 className="text-2xl font-bold text-gray-800">Employee Management</h2>
                <p className="text-gray-600">View and manage all employees</p>
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center"
                >
                  <FiPlus className="mr-2" /> Add Employee
                </Button>
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
                  placeholder="Search employees..."
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
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-6 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? 'No matching employees found' : 'No employees available'}
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr 
                      key={employee._id} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {columns.map((col) => (
                        <td 
                          key={col.key}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          {col.render ? col.render(employee[col.key], employee) : employee[col.key] ?? '-'}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => openAssignManagerModal(employee)}
                        >
                          Assign Manager
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-right">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{filteredEmployees.length}</span> of{' '}
              <span className="font-medium">{employees.length}</span> employees
            </p>
          </div>
        </div>

        {/* Assign Manager Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Assign Manager to {selectedEmployee?.name}
                </h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Manager
                  </label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={selectedManagerId}
                    onChange={e => setSelectedManagerId(e.target.value)}
                  >
                    <option value="">-- No Manager --</option>
                    {managers.map(mgr => (
                      <option key={mgr._id} value={mgr._id}>
                        {mgr.name} ({mgr.email})
                      </option>
                    ))}
                  </select>
                </div>

                {assignError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
                    {assignError}
                  </div>
                )}

                {assignSuccess && (
                  <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-md">
                    {assignSuccess}
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                    disabled={assignLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAssignManager}
                    loading={assignLoading}
                    disabled={assignLoading}
                  >
                    {assignLoading ? 'Assigning...' : 'Assign Manager'}
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

export default EmployeeList;