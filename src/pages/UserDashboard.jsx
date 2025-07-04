import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const UserDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get('/user/me');
        setProfile(res.data.user);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow w-full max-w-lg">
          <h1 className="text-2xl font-bold mb-6 text-center">Your Profile</h1>
          <div className="mb-4">
            <div className="font-medium">Name: {profile?.name}</div>
            <div className="font-medium">Email: {profile?.email}</div>
            <div className="font-medium">Role: {Array.isArray(profile?.roles) ? profile.roles.join(', ') : profile?.roles || '-'}</div>
            <div className="font-medium">Status: {profile?.active ? 'Active' : 'Inactive'}</div>
            <div className="font-medium">Created At: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}</div>
            <div className="font-medium">Last Login: {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Never'}</div>
            <div className="font-medium mt-2">Permissions:</div>
            <div className="flex flex-wrap gap-2 mb-2">
              {Array.isArray(profile?.permissions) && profile.permissions.length > 0
                ? profile.permissions.map((perm, idx) => (
                    <span key={idx} className="inline-block bg-gray-200 text-gray-700 rounded px-2 py-0.5 text-xs">
                      {perm}
                    </span>
                  ))
                : <span className="text-gray-400">No permissions</span>
              }
            </div>
          </div>
          <Link
            to="/forgot-password"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            Forgot Password
          </Link>
          <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="font-medium text-yellow-700">Announcements or updates will appear here.</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard; 