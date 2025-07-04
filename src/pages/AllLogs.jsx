import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import Table from '../components/Table';
import { FiRefreshCw } from 'react-icons/fi';

const columns = [
  { key: 'timestamp', title: 'Timestamp', render: (val, row) => new Date(row.timestamp || row.createdAt).toLocaleString() },
  { key: 'action', title: 'Action' },
  { key: 'userName', title: 'User Name', render: (val, row) => row.details?.userName || '-' },
  { key: 'userEmail', title: 'User Email', render: (val, row) => row.details?.userEmail || '-' },
  { key: 'method', title: 'Method' },
  { key: 'url', title: 'URL' },
  { key: 'ip', title: 'IP Address' },
];

const AllLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/log');
      setLogs(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Activity Logs</h1>
        <button
          onClick={fetchLogs}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          disabled={loading}
        >
          <FiRefreshCw className="mr-2" /> Refresh
        </button>
      </div>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <Table columns={columns} data={logs} loading={loading} emptyText="No logs found." />
    </div>
  );
};

export default AllLogs; 