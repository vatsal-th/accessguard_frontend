import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import Table from '../components/Table';
import { 
  FiRefreshCw, 
  FiTrash2, 
  FiFilter, 
  FiDownload, 
  FiArrowLeft,
  FiChevronDown,
  FiChevronUp,
  FiCalendar,
  FiUser,
  FiKey,
  FiEye,
  FiEdit,
  FiPlus,
  FiMinus,
  FiLock,
  FiShare2,
  FiList 
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const columns = [
  { 
    key: 'timestamp', 
    title: 'Timestamp', 
    render: (val, row) => (
      <div className="text-sm text-gray-600">
        {new Date(row.timestamp || row.createdAt).toLocaleString()}
      </div>
    ) 
  },
  { 
    key: 'action', 
    title: 'Action', 
    render: (val, row) => {
      const actionConfig = {
        // Authentication
        'LOGIN': { color: 'bg-green-100 text-green-800', icon: <FiKey className="h-3 w-3" /> },
        'login': { color: 'bg-green-100 text-green-800', icon: <FiKey className="h-3 w-3" /> },
        'LOGOUT': { color: 'bg-red-100 text-red-800', icon: <FiArrowLeft className="h-3 w-3" /> },
        'logout': { color: 'bg-red-100 text-red-800', icon: <FiArrowLeft className="h-3 w-3" /> },
        'REGISTER': { color: 'bg-blue-100 text-blue-800', icon: <FiUser className="h-3 w-3" /> },
        'register': { color: 'bg-blue-100 text-blue-800', icon: <FiUser className="h-3 w-3" /> },
        
        // View actions
        'view_own_profile': { color: 'bg-purple-100 text-purple-800', icon: <FiUser className="h-3 w-3" /> },
        'view_recent_users': { color: 'bg-cyan-100 text-cyan-800', icon: <FiEye className="h-3 w-3" /> },
        'view_team_stats': { color: 'bg-teal-100 text-teal-800', icon: <FiEye className="h-3 w-3" /> },
        
        // CRUD
        'CREATE': { color: 'bg-green-100 text-green-800', icon: <FiPlus className="h-3 w-3" /> },
        'UPDATE': { color: 'bg-yellow-100 text-yellow-800', icon: <FiEdit className="h-3 w-3" /> },
        'DELETE': { color: 'bg-red-100 text-red-800', icon: <FiTrash2 className="h-3 w-3" /> },
        
        // Status changes
        'deactivate_user': { color: 'bg-red-100 text-red-800', icon: <FiMinus className="h-3 w-3" /> },
        'activate_user': { color: 'bg-green-100 text-green-800', icon: <FiPlus className="h-3 w-3" /> },
        
        // Permissions
        'update_permissions': { color: 'bg-indigo-100 text-indigo-800', icon: <FiLock className="h-3 w-3" /> },
        
        // Assignments
        'assign-manager': { color: 'bg-blue-100 text-blue-800', icon: <FiShare2 className="h-3 w-3" /> },
        
        // Default
        'default': { color: 'bg-gray-100 text-gray-800', icon: <FiEdit className="h-3 w-3" /> }
      };
      
      const config = actionConfig[val] || actionConfig['default'];
      return (
        <div className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-2 ${config.color}`}>
          {config.icon}
          <span>{val}</span>
        </div>
      );
    }
  },
  { 
    key: 'userName', 
    title: 'User', 
    render: (val, row) => (
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs">
          {(row.details?.userName || row.userName || '?').charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="text-sm font-medium">{row.details?.userName || row.userName || '-'}</div>
          <div className="text-xs text-gray-500">{row.details?.userEmail || row.userEmail || ''}</div>
        </div>
      </div>
    ) 
  },
  { 
    key: 'method', 
    title: 'Method', 
    render: (val, row) => {
      const method = val || row.method || '-';
      const colorMap = {
        'GET': 'bg-blue-100 text-blue-800',
        'POST': 'bg-green-100 text-green-800',
        'PUT': 'bg-yellow-100 text-yellow-800',
        'PATCH': 'bg-orange-100 text-orange-800',
        'DELETE': 'bg-red-100 text-red-800',
        'default': 'bg-gray-100 text-gray-800'
      };
      const colorClass = colorMap[method] || colorMap['default'];
      
      return (
        <span className={`px-2 py-1 rounded text-xs font-mono font-medium ${colorClass}`}>
          {method}
        </span>
      );
    }
  },
  { 
    key: 'url', 
    title: 'Endpoint', 
    render: (val, row) => (
      <div className="text-xs font-mono text-gray-700 truncate max-w-xs" title={val || row.url || '-'}>
        {val || row.url || '-'}
      </div>
    ) 
  },
  { 
    key: 'ip', 
    title: 'IP', 
    render: (val) => (
      <span className="text-xs font-mono text-gray-600">{val || '-'}</span>
    ) 
  }
];

const AllLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clearing, setClearing] = useState(false);
  const [filters, setFilters] = useState({
    action: '',
    method: '',
    userEmail: '',
    dateFrom: '',
    dateTo: '',
    category: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedLog, setExpandedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('limit', '500');
      
      const res = await axiosInstance.get(`/log?${params.toString()}`);
      setLogs(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all logs? This cannot be undone.')) return;
    setClearing(true);
    try {
      await axiosInstance.delete('/log/clear');
      await fetchLogs();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to clear logs');
    } finally {
      setClearing(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    fetchLogs();
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({
      action: '',
      method: '',
      userEmail: '',
      dateFrom: '',
      dateTo: '',
      category: ''
    });
    fetchLogs();
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Action', 'User', 'Method', 'Endpoint', 'IP', 'Details'].join(','),
      ...logs.map(log => [
        new Date(log.timestamp || log.createdAt).toISOString(),
        log.action,
        log.details?.userName || log.userName || '',
        log.method,
        log.url,
        log.ip,
        JSON.stringify(log.details || {})
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `accessguard_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    if (filters.action && log.action !== filters.action) return false;
    if (filters.method && (log.method || '-') !== filters.method) return false;
    if (filters.userEmail && !(log.details?.userEmail || log.userEmail || '').toLowerCase().includes(filters.userEmail.toLowerCase())) return false;
    if (filters.dateFrom && new Date(log.timestamp || log.createdAt) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(log.timestamp || log.createdAt) > new Date(filters.dateTo)) return false;
    if (filters.category) {
      const action = log.action || '';
      switch(filters.category) {
        case 'auth': return ['LOGIN', 'LOGOUT', 'REGISTER', 'login', 'logout', 'register'].includes(action);
        case 'view': return action.startsWith('view_');
        case 'crud': return ['CREATE', 'UPDATE', 'DELETE', 'update_user', 'delete_user'].includes(action);
        case 'status': return ['deactivate_user', 'activate_user'].includes(action);
        case 'permissions': return action === 'update_permissions';
        case 'assignment': return action === 'assign-manager';
        default: return true;
      }
    }
    return true;
  });

  const actionTypes = [...new Set(logs.map(log => log.action))].filter(Boolean).sort();
  const methodTypes = [...new Set(logs.map(log => log.method))].filter(Boolean).sort();

  const logStats = {
    total: logs.length,
    auth: logs.filter(log => ['LOGIN', 'LOGOUT', 'REGISTER', 'login', 'logout', 'register'].includes(log.action)).length,
    view: logs.filter(log => log.action?.startsWith('view_')).length,
    crud: logs.filter(log => ['CREATE', 'UPDATE', 'DELETE', 'update_user', 'delete_user'].includes(log.action)).length,
    status: logs.filter(log => ['deactivate_user', 'activate_user'].includes(log.action)).length,
    permissions: logs.filter(log => log.action === 'update_permissions').length,
    assignment: logs.filter(log => log.action === 'assign-manager').length
  };

  const toggleExpandLog = (logId) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiArrowLeft className="mr-2" /> Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Activity Logs</h1>
              <p className="text-sm text-gray-500">Detailed audit trail of all system activities</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiFilter className="mr-2" /> {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button
              onClick={exportLogs}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={logs.length === 0}
            >
              <FiDownload className="mr-2" /> Export
            </button>
            <button
              onClick={fetchLogs}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
              onClick={handleClearLogs}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              disabled={clearing}
            >
              <FiTrash2 className={`mr-2 ${clearing ? 'animate-spin' : ''}`} /> Clear Logs
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
          <StatCard 
            title="Total" 
            value={logStats.total} 
            icon={<FiList className="h-4 w-4" />} 
            color="gray" 
          />
          <StatCard 
            title="Auth" 
            value={logStats.auth} 
            icon={<FiKey className="h-4 w-4" />} 
            color="green" 
          />
          <StatCard 
            title="Views" 
            value={logStats.view} 
            icon={<FiEye className="h-4 w-4" />} 
            color="blue" 
          />
          <StatCard 
            title="CRUD" 
            value={logStats.crud} 
            icon={<FiEdit className="h-4 w-4" />} 
            color="yellow" 
          />
          <StatCard 
            title="Status" 
            value={logStats.status} 
            icon={<FiPlus className="h-4 w-4" />} 
            color="red" 
          />
          <StatCard 
            title="Permissions" 
            value={logStats.permissions} 
            icon={<FiLock className="h-4 w-4" />} 
            color="indigo" 
          />
          <StatCard 
            title="Assignments" 
            value={logStats.assignment} 
            icon={<FiShare2 className="h-4 w-4" />} 
            color="purple" 
          />
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Logs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">All Categories</option>
                  <option value="auth">Authentication</option>
                  <option value="view">View Actions</option>
                  <option value="crud">CRUD Operations</option>
                  <option value="status">Status Changes</option>
                  <option value="permissions">Permissions</option>
                  <option value="assignment">Assignments</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                <select
                  name="action"
                  value={filters.action}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">All Actions</option>
                  {actionTypes.map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HTTP Method</label>
                <select
                  name="method"
                  value={filters.method}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">All Methods</option>
                  {methodTypes.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Email</label>
                <input
                  type="text"
                  name="userEmail"
                  value={filters.userEmail}
                  onChange={handleFilterChange}
                  placeholder="Filter by email"
                  className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCalendar className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCalendar className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear Filters
              </button>
              <button
                onClick={handleApplyFilters}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{filteredLogs.length}</span> of{' '}
            <span className="font-medium">{logs.length}</span> logs
          </p>
          {loading && (
            <p className="text-sm text-gray-500 flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </p>
          )}
        </div>

        {/* Logs Table */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.title}
                  </th>
                ))}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-gray-500">
                    {loading ? 'Loading logs...' : 'No logs match your filters'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <React.Fragment key={log._id || log.id}>
                    <tr 
                      className={`hover:bg-gray-50 cursor-pointer ${expandedLog === (log._id || log.id) ? 'bg-gray-50' : ''}`}
                      onClick={() => toggleExpandLog(log._id || log.id)}
                    >
                      {columns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          {column.render ? column.render(log[column.key], log) : log[column.key] || '-'}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpandLog(log._id || log.id);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {expandedLog === (log._id || log.id) ? (
                            <FiChevronUp className="h-5 w-5" />
                          ) : (
                            <FiChevronDown className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedLog === (log._id || log.id) && (
                      <tr className="bg-gray-50">
                        <td colSpan={columns.length + 1} className="px-6 py-4">
                          <div className="bg-gray-100 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Full Details</h4>
                            <pre className="text-xs text-gray-600 overflow-x-auto">
                              {JSON.stringify(log.details || log, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// StatCard component
const StatCard = ({ title, value, icon, color = 'gray' }) => {
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    purple: 'bg-purple-100 text-purple-800'
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${colorClasses[color]}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllLogs;