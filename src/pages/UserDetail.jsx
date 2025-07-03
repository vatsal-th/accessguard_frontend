import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import Sidebar from "../components/Sidebar";
import Input from "../components/Input";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

const ALL_PERMISSIONS = [
  "can_edit_users",
  "can_view_reports",
  "can_delete_users",
  // ...add more as needed
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
          setError("Forbidden: You do not have permission to view this user.");
          setLoading(false);
          return;
        }
        setUserData(res.data.user || res.data);
        setForm({
          name: res.data.user?.name || res.data.name || "",
          email: res.data.user?.email || res.data.email || "",
          role:
            (res.data.user?.roles && res.data.user.roles[0]) ||
            (res.data.roles && res.data.roles[0]) ||
            "user",
        });
        setEditPermissions(
          res.data.user?.permissions || res.data.permissions || []
        );
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
      navigate("/users");
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
      setSuccess("User deactivated");
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
      setSuccess("User activated");
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
      setSuccess("Permissions updated!");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update permissions");
    } finally {
      setSavingPerms(false);
    }
  };
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 px-6 py-10 flex justify-center">
        <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-2xl border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-center">User Profile</h2>

          {loading ? (
            <p className="text-center text-gray-500">Loading user details...</p>
          ) : error ? (
            <p className="text-center text-red-500 mb-4">{error}</p>
          ) : userData ? (
            <>
              {/* Permissions Display */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                  Current Permissions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userData.permissions?.length > 0 ? (
                    userData.permissions.map((perm, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded"
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

              {/* Edit Permissions */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Edit Permissions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_PERMISSIONS.map((perm) => (
                    <label
                      key={perm}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={editPermissions.includes(perm)}
                        onChange={() => handlePermissionChange(perm)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span>{perm}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3">
                  <Button
                    type="button"
                    onClick={handleSavePermissions}
                    loading={savingPerms}
                  >
                    Save Permissions
                  </Button>
                </div>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleSave} className="space-y-4">
                <Input
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  disabled={!isAdmin && !isSelf}
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={!isAdmin && !isSelf}
                />

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Role
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!isAdmin}
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="employee">Employee</option>
                    <option value="user">User</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  {userData.active ? (
                    <Button
                      type="button"
                      variant="danger"
                      onClick={handleDeactivate}
                      disabled={!isAdmin}
                    >
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleActivate}
                      disabled={!isAdmin}
                    >
                      Activate
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => setShowDelete(true)}
                    disabled={!isAdmin}
                  >
                    Delete
                  </Button>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-600 text-sm">{success}</p>}

                <Button
                  type="submit"
                  loading={saving}
                  className="w-full mt-3"
                  disabled={!isAdmin && !isSelf}
                >
                  Save Changes
                </Button>
              </form>
            </>
          ) : (
            <p className="text-center text-gray-400">User not found.</p>
          )}
        </div>

        {/* Delete Modal */}
        <Modal
          open={showDelete}
          onClose={() => setShowDelete(false)}
          title="Confirm Delete"
        >
          <p className="mb-4">
            Are you sure you want to delete this user? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </Modal>
      </main>
    </div>
  );
};

export default UserDetail;
