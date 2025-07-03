import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">AccessGuard Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {error && <div className="text-sm text-red-500">{error}</div>}

          <Button type="submit" className="w-full" loading={loading}>
            Login
          </Button>
        </form>

        <div className="flex justify-between text-sm mt-4 text-gray-500">
          <Link to="/register" className="text-blue-600 hover:underline">Create an account</Link>
          <Link to="/forgot-password" className="text-blue-600 hover:underline">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
