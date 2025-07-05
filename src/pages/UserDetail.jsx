import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import Sidebar from "../components/Sidebar";
import Input from "../components/Input";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { 
  FiUser, 
  FiMail, 
  FiShield, 
  FiCheckCircle, 
  FiXCircle, 
  FiTrash2,
  FiEdit2,
  FiLock,
  FiArrowLeft
} from "react-icons/fi";

const ALL_PERMISSIONS = [
  "can_edit_users",
  "can_view_reports",
  "can_delete_users",
  "can_manage_content",
  "can_view_analytics",
  "can_export_data"
];

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = Array.isArray(user?.roles) && user.roles.includes("admin");
  const isSelf = user?.id === id;
  const [userData, setUserData] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", role: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [editPermissions, setEditPermissions] = useState([]);
  const [savingPerms, setSavingPerms] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError("");
      try {
        let res;
        if (isAdmin) {
          res = await axiosInstance.get(`/user/${id}`);
        } else if (isSelf) {
          res = await axiosInstance.get("/user/me");
        } else {
          setError("You don't have permission to view this user");
          setLoading(false);
          return;
        }
        const data = res.data.user || res.data;
        setUserData(data);
        setForm({
          name: data.name || "",
          email: data.email || "",
          role: (data.roles && data.roles[0]) || "user",
        });
        setEditPermissions(data.permissions || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, isAdmin, isSelf]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await axiosInstance.put(`/user/${id}`, { ...form, roles: [form.role] });
      setSuccess("User updated successfully");
      setTimeout(() => navigate("/users"), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setError("");
    setSuccess("");
    try {
      await axiosInstance.delete(`/user/${id}`);
      setShowDelete(false);
      navigate("/users");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete user");
    }
  };

  const handleDeactivate = async () => {
    setError("");
    setSuccess("");
    try {
      await axiosInstance.patch(`/user/${id}/deactivate`);
      setUserData({ ...userData, active: false });
      setSuccess("User deactivated successfully");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to deactivate user");
    }
  };

  const handleActivate = async () => {
    setError("");
    setSuccess("");
    try {
      await axiosInstance.patch(`/user/${id}/activate`);
      setUserData({ ...userData, active: true });
      setSuccess("User activated successfully");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to activate user");
    }
  };

  const handlePermissionChange = (perm) => {
    setEditPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSavePermissions = async () => {
    setSavingPerms(true);
    setError("");
    setSuccess("");
    try {
      await axiosInstance.patch(`/user/${userData._id}/permissions`, {
        permissions: editPermissions,
      });
      setUserData({ ...userData, permissions: editPermissions });
      setSuccess("Permissions updated successfully");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update permissions");
    } finally {
      setSavingPerms(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-md text-center">
            <div className="bg-red-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <FiXCircle className="text-red-500 text-xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading User</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate(-1)} variant="secondary">
              <FiArrowLeft className="mr-2" />
              Go Back
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm shadow-sm"
              >
                <FiArrowLeft className="mr-2" /> Back
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">User Management</h1>
                <p className="text-gray-600">View and manage user details</p>
              </div>
            </div>
          </div>

          {/* User Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            {/* User Status Bar */}
            <div className={`px-6 py-3 ${userData.active ? 'bg-green-50' : 'bg-red-50'} border-b border-gray-200`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${userData.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-sm font-medium ${userData.active ? 'text-green-800' : 'text-red-800'}`}>
                    {userData.active ? 'Active' : 'Inactive'} User
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {userData.active ? (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={handleDeactivate}
                      disabled={!isAdmin}
                    >
                      <FiXCircle className="mr-1.5" />
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleActivate}
                      disabled={!isAdmin}
                    >
                      <FiCheckCircle className="mr-1.5" />
                      Activate
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setShowDelete(true)}
                    disabled={!isAdmin}
                  >
                    <FiTrash2 className="mr-1.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
              {/* Status Messages */}
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start mb-6">
                  <div className="flex-shrink-0 mt-0.5">
                    <FiXCircle className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p>{error}</p>
                  </div>
                </div>
              )}
              
              {success && (
                <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm flex items-start mb-6">
                  <div className="flex-shrink-0 mt-0.5">
                    <FiCheckCircle className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p>{success}</p>
                  </div>
                </div>
              )}

              {/* User Info Form */}
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    disabled={!isAdmin && !isSelf}
                    icon={<FiUser className="text-gray-400" />}
                  />
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled={!isAdmin && !isSelf}
                    icon={<FiMail className="text-gray-400" />}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Role
                    </label>
                    <div className="relative">
                      <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                        disabled={!isAdmin}
                      >
                        <option value="admin">Administrator</option>
                        <option value="manager">Manager</option>
                        <option value="employee">Employee</option>
                        <option value="user">Regular User</option>
                      </select>
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiShield className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Status
                    </label>
                    <div className="relative">
                      <select
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                        disabled
                        value={userData.active ? 'active' : 'inactive'}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Permissions Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">User Permissions</h3>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Current Permissions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {userData.permissions?.length > 0 ? (
                        userData.permissions.map((perm, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full"
                          >
                            {perm}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">
                          No permissions assigned
                        </span>
                      )}
                    </div>
                  </div>

                  {isAdmin && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Edit Permissions
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {ALL_PERMISSIONS.map((perm) => (
                          <label
                            key={perm}
                            className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={editPermissions.includes(perm)}
                              onChange={() => handlePermissionChange(perm)}
                              className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">{perm}</span>
                          </label>
                        ))}
                      </div>
                      <Button
                        type="button"
                        onClick={handleSavePermissions}
                        loading={savingPerms}
                        className="w-full sm:w-auto"
                      >
                        <FiEdit2 className="mr-2" />
                        Update Permissions
                      </Button>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <Button
                    type="submit"
                    loading={saving}
                    disabled={!isAdmin && !isSelf}
                    className="w-full sm:w-auto"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Delete Modal */}
        <Modal
          open={showDelete}
          onClose={() => setShowDelete(false)}
          title="Confirm User Deletion"
        >
          <div className="space-y-4">
            <div className="bg-red-50 rounded-lg p-4 flex items-start">
              <div className="flex-shrink-0">
                <FiXCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Warning: This action cannot be undone</h3>
                <p className="text-sm text-red-700 mt-1">
                  All user data will be permanently removed from the system.
                </p>
              </div>
            </div>
            <p className="text-gray-600">
              Are you sure you want to delete <span className="font-semibold">{userData?.name}</span>? 
              This will permanently remove their account and all associated data.
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowDelete(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                <FiTrash2 className="mr-2" />
                Delete User
              </Button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
};

export default UserDetail;