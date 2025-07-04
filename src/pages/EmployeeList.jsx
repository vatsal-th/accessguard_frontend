import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';

const EmployeeList = () => {
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

  useEffect(() => {
    // Fetch employees
    const fetchEmployees = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get('/user/employees');
        setEmployees(Array.isArray(res.data) ? res.data : res.data.users || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load employees');
      } finally {
        setLoading(false);
      }
    };
    // Fetch managers
    const fetchManagers = async () => {
      const res = await axiosInstance.get('/user/managers');
      setManagers(Array.isArray(res.data) ? res.data : res.data.users || []);
    };
    fetchEmployees();
    fetchManagers();
  }, []);

  const openAssignManagerModal = (employee) => {
    setSelectedEmployee(employee);
    setSelectedManagerId(employee.manager || '');
    setAssignError('');
    setAssignSuccess('');
    setShowModal(true);
  };

  const handleAssignManager = async () => {
    if (!selectedManagerId) {
      setAssignError('Please select a manager.');
      return;
    }
    setAssignLoading(true);
    setAssignError('');
    setAssignSuccess('');
    try {
      await axiosInstance.put(`/user/${selectedEmployee._id}/assign-manager`, { managerId: selectedManagerId });
      setAssignSuccess('Manager assigned successfully.');
      // Update employee in list
      setEmployees(prev => prev.map(emp => emp._id === selectedEmployee._id ? { ...emp, manager: selectedManagerId } : emp));
      setShowModal(false);
    } catch (err) {
      setAssignError(err?.response?.data?.message || 'Failed to assign manager.');
    } finally {
      setAssignLoading(false);
    }
  };

  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'email', title: 'Email' },
    { key: 'roles', title: 'Role', render: (val) => <span className="capitalize">{Array.isArray(val) ? val.join(', ') : val}</span> },
    { key: 'manager', title: 'Manager', render: (val, row) => val ? managers.find(m => m._id === val)?.name || val : <span className="text-gray-400">None</span> },
    { key: 'active', title: 'Status', render: (val) => val ? <span className="text-green-600">Active</span> : <span className="text-red-500">Inactive</span> },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 px-6 py-10">
        <div className="bg-white rounded-xl shadow-md p-6 max-w-6xl mx-auto border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Employee List</h2>
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
                  <th className="px-4 py-3 text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={columns.length + 1} className="text-center py-8 text-gray-500">Loading employees...</td></tr>
                ) : employees.length === 0 ? (
                  <tr><td colSpan={columns.length + 1} className="text-center py-8 text-gray-400">No employees found.</td></tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee._id} className="border-t hover:bg-gray-50 transition-colors">
                      {columns.map((col) => (
                        <td key={col.key} className="px-4 py-3 align-top whitespace-nowrap">
                          {col.render ? col.render(employee[col.key], employee) : employee[col.key] ?? '-'}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <Button size="sm" onClick={() => openAssignManagerModal(employee)}>
                          Assign Manager
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Assign Manager Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Assign Manager</h3>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">Select Manager</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={selectedManagerId}
                  onChange={e => setSelectedManagerId(e.target.value)}
                >
                  <option value="">-- Select Manager --</option>
                  {managers.map(mgr => (
                    <option key={mgr._id} value={mgr._id}>{mgr.name}</option>
                  ))}
                </select>
              </div>
              {assignError && <div className="mb-2 text-red-600 text-sm">{assignError}</div>}
              {assignSuccess && <div className="mb-2 text-green-600 text-sm">{assignSuccess}</div>}
              <div className="flex justify-end gap-2 mt-4">
                <Button onClick={() => setShowModal(false)} variant="secondary">Cancel</Button>
                <Button onClick={handleAssignManager} loading={assignLoading}>
                  Assign
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployeeList; 