import React, { useState } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import axiosInstance from '../api/axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiLock, FiArrowLeft, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

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
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Calculate password strength when password changes
    if (name === 'password') {
      let strength = 0;
      if (value.length > 0) strength += 1;
      if (value.length >= 8) strength += 1;
      if (/[A-Z]/.test(value)) strength += 1;
      if (/[0-9]/.test(value)) strength += 1;
      if (/[^A-Za-z0-9]/.test(value)) strength += 1;
      setPasswordStrength(strength);
    }
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
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-full mb-3">
            <FiLock className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white">Reset Password</h2>
          <p className="text-blue-100 mt-1">Create a new secure password</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Input
                label="New Password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                required
                icon={<FiLock className="text-gray-400" />}
                placeholder="••••••••"
              />
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div 
                        key={i}
                        className={`flex-1 rounded-full ${i <= passwordStrength ? getPasswordStrengthColor(passwordStrength) : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Password strength: {passwordStrength <= 1 ? "Very weak" : 
                                     passwordStrength === 2 ? "Weak" : 
                                     passwordStrength === 3 ? "Moderate" : 
                                     passwordStrength === 4 ? "Strong" : "Very strong"}
                  </p>
                </div>
              )}
            </div>
            
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              icon={<FiCheckCircle className="text-gray-400" />}
              placeholder="••••••••"
            />

            {/* Status messages */}
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <FiAlertCircle className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p>{error}</p>
                </div>
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <FiCheckCircle className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p>{success}</p>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              loading={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
              disabled={loading}
            >
              {loading ? 'Resetting password...' : 'Reset Password'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              Return to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;