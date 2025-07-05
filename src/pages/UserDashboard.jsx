import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FiUser, FiMail, FiShield, FiClock, FiKey, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

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

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 w-full max-w-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-gray-50 p-6">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold mr-4">
                  {profile?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{profile?.name}</h1>
                  <p className="text-gray-600">{profile?.email}</p>
                </div>
              </div>
            </div>
            
            {/* Profile Details */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <FiUser className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                    <p className="text-sm text-gray-900">{profile?.name}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiMail className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                    <p className="text-sm text-gray-900">{profile?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiShield className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Account Role</h3>
                    <p className="text-sm text-gray-900">
                      {Array.isArray(profile?.roles) ? profile.roles.join(', ') : profile?.roles || '-'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <FiCheckCircle className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Account Status</h3>
                    <p className="text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        profile?.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {profile?.active ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiClock className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
                    <p className="text-sm text-gray-900">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiClock className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Last Login</h3>
                    <p className="text-sm text-gray-900">
                      {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Permissions Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FiShield className="mr-2 text-gray-500" /> Your Permissions
            </h2>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(profile?.permissions) && profile.permissions.length > 0 ? (
                profile.permissions.map((perm, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {perm}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No specific permissions assigned</p>
              )}
            </div>
          </div>

          {/* Actions Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FiKey className="mr-2 text-gray-500" /> Account Security
              </h2>
              <div className="space-y-3">
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Change Password
                </Link>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-xl border-l-4 border-yellow-400 p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiAlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Announcements</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Important updates or notifications will appear here.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;