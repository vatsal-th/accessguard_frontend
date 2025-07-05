import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import Table from '../components/Table';
import { FiRefreshCw, FiTrash2, FiFilter, FiDownload, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const columns = [
  { key: 'timestamp', title: 'Timestamp', render: (val, row) => new Date(row.timestamp || row.createdAt).toLocaleString() },
  { key: 'action', title: 'Action', render: (val, row) => {
    // Enhanced action rendering with better categorization
    const getActionConfig = (action) => {
      const configs = {
        // Authentication actions
        'LOGIN': { color: 'bg-green-100 text-green-800', icon: '🔐' },
        'login': { color: 'bg-green-100 text-green-800', icon: '🔐' },
        'LOGOUT': { color: 'bg-red-100 text-red-800', icon: '🚪' },
        'logout': { color: 'bg-red-100 text-red-800', icon: '🚪' },
        'REGISTER': { color: 'bg-blue-100 text-blue-800', icon: '📝' },
        'register': { color: 'bg-blue-100 text-blue-800', icon: '📝' },
        
        // View actions
        'view_own_profile': { color: 'bg-purple-100 text-purple-800', icon: '👤' },
        'view_recent_users': { color: 'bg-cyan-100 text-cyan-800', icon: '👥' },
        'view_team_stats': { color: 'bg-teal-100 text-teal-800', icon: '📈' },
        'view_admins': { color: 'bg-orange-100 text-orange-800', icon: '👑' },
        'view_managers': { color: 'bg-yellow-100 text-yellow-800', icon: '👔' },
        'view_employees': { color: 'bg-lime-100 text-lime-800', icon: '👷' },
        'view_my_team': { color: 'bg-emerald-100 text-emerald-800', icon: '🤝' },
        'list_users': { color: 'bg-sky-100 text-sky-800', icon: '📋' },
        'get_user': { color: 'bg-violet-100 text-violet-800', icon: '🔍' },
        
        // CRUD actions
        'CREATE': { color: 'bg-green-100 text-green-800', icon: '➕' },
        'UPDATE': { color: 'bg-yellow-100 text-yellow-800', icon: '✏️' },
        'DELETE': { color: 'bg-red-100 text-red-800', icon: '🗑️' },
        'update_user': { color: 'bg-yellow-100 text-yellow-800', icon: '✏️' },
        'delete_user': { color: 'bg-red-100 text-red-800', icon: '🗑️' },
          
        // Status actions
        'deactivate_user': { color: 'bg-red-100 text-red-800', icon: '⏸️' },
        'activate_user': { color: 'bg-green-100 text-green-800', icon: '▶️' },
        
        // Permission actions
        'update_permissions': { color: 'bg-purple-100 text-purple-800', icon: '🔐' },
        
        // Assignment actions
        'assign-manager': { color: 'bg-blue-100 text-blue-800', icon: '👥' },
        
        // Default
        'default': { color: 'bg-gray-100 text-gray-800', icon: '📝' }
      };
      
      return configs[action] || configs['default'];
    };
    
    const config = getActionConfig(val);
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1 ${config.color}`}>
        <span>{config.icon}</span>
        {val}
      </span>
    );
  }},
  { key: 'userName', title: 'User Name', render: (val, row) => row.details?.userName || row.userName || '-' },
  { key: 'userEmail', title: 'User Email', render: (val, row) => row.details?.userEmail || row.userEmail || '-' },
  { key: 'method', title: 'Method', render: (val, row) => {
    const method = val || row.method || '-';
    if (method === '-') return <span className="text-gray-400">-</span>;
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        method === 'GET' ? 'bg-blue-100 text-blue-800' :
        method === 'POST' ? 'bg-green-100 text-green-800' :
        method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
        method === 'PATCH' ? 'bg-orange-100 text-orange-800' :
        method === 'DELETE' ? 'bg-red-100 text-red-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {method}
      </span>
    );
  }},
  { key: 'url', title: 'URL', render: (val, row) => {
    const url = val || row.url || '-';
    if (url === '-') return <span className="text-gray-400">-</span>;
    return <span className="text-xs font-mono">{url}</span>;
  }},
  { key: 'ip', title: 'IP Address', render: (val) => <span className="text-xs font-mono">{val || '-'}</span> },
  { key: 'details', title: 'Details', render: (val, row) => {
    if (!val) return '-';
    const details = typeof val === 'string' ? val : JSON.stringify(val);
    return <span className="text-xs text-gray-600" title={details}>{details.length > 50 ? details.substring(0, 50) + '...' : details}</span>;
  }},
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

  const fetchLogs = async (queryParams = {}) => {
    setLoading(true);
    setError('');
    try {
      // Build query parameters to get all logs
      const params = new URLSearchParams();
      
      // Add filters if they exist
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      // Add any additional query parameters
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      // Request all logs with no type filtering
      params.append('all', 'true');
      params.append('limit', '1000'); // Get more logs

      const res = await axiosInstance.get(`/log?${params.toString()}`);
      setLogs(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all logs? This action cannot be undone.')) return;
    setClearing(true);
    setError('');
    try {
      await axiosInstance.delete('/log/clear');
      await fetchLogs();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to clear logs');
    } finally {
      setClearing(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchLogs();
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
      ['Timestamp', 'Action', 'User Name', 'User Email', 'Method', 'URL', 'IP Address', 'Details'].join(','),
      ...logs.map(log => [
        new Date(log.timestamp || log.createdAt).toLocaleString(),
        log.action,
        log.details?.userName || log.userName || '',
        log.details?.userEmail || log.userEmail || '',
        log.method,
        log.url,
        log.ip,
        typeof log.details === 'string' ? log.details : JSON.stringify(log.details || '')
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    if (filters.action && log.action !== filters.action) return false;
    if (filters.method && (log.method || '-') !== filters.method) return false;
    if (filters.userEmail && !(log.details?.userEmail || log.userEmail || '').toLowerCase().includes(filters.userEmail.toLowerCase())) return false;
    if (filters.dateFrom) {
      const logDate = new Date(log.timestamp || log.createdAt);
      const fromDate = new Date(filters.dateFrom);
      if (logDate < fromDate) return false;
    }
    if (filters.dateTo) {
      const logDate = new Date(log.timestamp || log.createdAt);
      const toDate = new Date(filters.dateTo);
      if (logDate > toDate) return false;
    }
    if (filters.category) {
      const category = filters.category;
      const action = log.action || '';
      if (category === 'auth' && !['LOGIN', 'LOGOUT', 'REGISTER', 'login', 'logout', 'register'].includes(action)) return false;
      if (category === 'view' && !action.startsWith('view_')) return false;
      if (category === 'crud' && !['CREATE', 'UPDATE', 'DELETE', 'update_user', 'delete_user'].includes(action)) return false;
      if (category === 'status' && !['deactivate_user', 'activate_user'].includes(action)) return false;
      if (category === 'permissions' && action !== 'update_permissions') return false;
      if (category === 'assignment' && action !== 'assign-manager') return false;
    }
    return true;
  });

  const actionTypes = [...new Set(logs.map(log => log.action))].filter(Boolean).sort();
  const methodTypes = [...new Set(logs.map(log => log.method))].filter(Boolean).sort();

  // Get log statistics
  const logStats = {
    total: logs.length,
    auth: logs.filter(log => ['LOGIN', 'LOGOUT', 'REGISTER', 'login', 'logout', 'register'].includes(log.action)).length,
    view: logs.filter(log => log.action && log.action.startsWith('view_')).length,
    crud: logs.filter(log => ['CREATE', 'UPDATE', 'DELETE', 'update_user', 'delete_user'].includes(log.action)).length,
    status: logs.filter(log => ['deactivate_user', 'activate_user'].includes(log.action)).length,
    permissions: logs.filter(log => log.action === 'update_permissions').length,
    assignment: logs.filter(log => log.action === 'assign-manager').length
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            <FiArrowLeft className="mr-2" /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">All Activity Logs</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            <FiFilter className="mr-2" /> Filters
          </button>
          <button
            onClick={exportLogs}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            disabled={logs.length === 0}
          >
            <FiDownload className="mr-2" /> Export
          </button>
          <button
            onClick={() => fetchLogs()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            disabled={loading}
          >
            <FiRefreshCw className="mr-2" /> Refresh
          </button>
          <button
            onClick={handleClearLogs}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            disabled={clearing}
          >
            <FiTrash2 className="mr-2" /> Clear Logs
          </button>
        </div>
      </div>

      {/* Log Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <div className="bg-white p-3 rounded-lg shadow text-center">
          <div className="text-lg font-bold text-gray-800">{logStats.total}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg shadow text-center">
          <div className="text-lg font-bold text-green-800">{logStats.auth}</div>
          <div className="text-xs text-green-600">Auth</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg shadow text-center">
          <div className="text-lg font-bold text-blue-800">{logStats.view}</div>
          <div className="text-xs text-blue-600">Views</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg shadow text-center">
          <div className="text-lg font-bold text-yellow-800">{logStats.crud}</div>
          <div className="text-xs text-yellow-600">CRUD</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg shadow text-center">
          <div className="text-lg font-bold text-purple-800">{logStats.status}</div>
          <div className="text-xs text-purple-600">Status</div>
        </div>
        <div className="bg-indigo-50 p-3 rounded-lg shadow text-center">
          <div className="text-lg font-bold text-indigo-800">{logStats.permissions}</div>
          <div className="text-xs text-indigo-600">Permissions</div>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg shadow text-center">
          <div className="text-lg font-bold text-orange-800">{logStats.assignment}</div>
          <div className="text-xs text-orange-600">Assignments</div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold mb-3">Filter Logs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="">All Actions</option>
                {actionTypes.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
              <select
                value={filters.method}
                onChange={(e) => handleFilterChange('method', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
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
                value={filters.userEmail}
                onChange={(e) => handleFilterChange('userEmail', e.target.value)}
                placeholder="Filter by email"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {error && <div className="mb-4 text-red-600">{error}</div>}
      
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredLogs.length} of {logs.length} total logs
      </div>

      <Table 
        columns={columns} 
        data={filteredLogs} 
        loading={loading} 
        emptyText="No logs found." 
      />
    </div>
  );
};

export default AllLogs; 