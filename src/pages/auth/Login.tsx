import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { BookOpen } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [registration_number, setRegistrationNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, registration_number, password });
      login(response.data.token, response.data.user);

      if (response.data.user.role === 'student') navigate('/student/domains');
      else if (response.data.user.role === 'teacher') navigate('/teacher/dashboard');
      else if (response.data.user.role === 'admin') navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-brand-900/20 ring-1 ring-ink-900/5">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-50 to-accent-100 border border-accent-200 shadow-sm mb-2">
            <BookOpen className="h-8 w-8 text-accent-500" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-ink-900 tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-ink-500">Sign in to your EduGap AI account</p>
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-error-100 text-error-600 rounded-xl text-sm font-medium text-center">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5 ml-1">VIT Email address</label>
              <input
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-4 py-3 bg-white/50 border border-ink-200 placeholder-ink-400 text-ink-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all sm:text-sm shadow-sm"
                placeholder="you@vitstudent.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5 ml-1">Registration / Staff ID</label>
              <input
                name="registration_number"
                type="text"
                required
                className="appearance-none relative block w-full px-4 py-3 bg-white/50 border border-ink-200 placeholder-ink-400 text-ink-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all sm:text-sm shadow-sm"
                placeholder="21BCE0000"
                value={registration_number}
                onChange={(e) => setRegistrationNumber(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5 ml-1">Password</label>
              <input
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 bg-white/50 border border-ink-200 placeholder-ink-400 text-ink-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all sm:text-sm shadow-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-accent-500 hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-400 shadow-md transition-all duration-200 active:scale-[0.98]"
            >
              Sign in
            </button>
          </div>
          <div className="text-sm text-center pt-2">
            <Link
              to="/register"
              className="font-semibold text-accent-500 hover:text-accent-600 transition-colors"
            >
              Don't have an account? <span className="underline decoration-accent-300 underline-offset-4">Register here</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
