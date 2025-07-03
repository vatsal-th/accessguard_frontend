import React, { useState } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import axiosInstance from '../api/axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiLock, FiArrowLeft } from 'react-icons/fi';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ResetPassword = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const token = query.get('token');

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/auth/reset-password', {
        password: form.password,
        token,
      });
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md border border-gray-100">
        <div className="text-center mb-6">
          <div className="flex justify-center items-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
            <FiLock className="text-blue-600" size={20} />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Reset Your Password</h2>
          <p className="text-sm text-gray-500 mt-1">Enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="New Password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            required
            icon={<FiLock className="text-gray-400" />}
            placeholder="Enter new password"
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            icon={<FiLock className="text-gray-400" />}
            placeholder="Confirm new password"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <Button
            type="submit"
            loading={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow"
          >
            Reset Password
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-blue-600 hover:underline"
          >
            <FiArrowLeft className="mr-1" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
