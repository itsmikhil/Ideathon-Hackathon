import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { BookOpen } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [registration_number, setRegistrationNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { name, email, registration_number, password, role });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 py-12 px-4 sm:px-6 lg:px-8 mt-[-64px]">
      <div className="max-w-md w-full space-y-6 bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-brand-900/20 ring-1 ring-ink-900/5">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-50 to-accent-100 border border-accent-200 shadow-sm mb-2">
            <BookOpen className="h-8 w-8 text-accent-500" />
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-ink-900 tracking-tight">Join EduGap AI</h2>
          <p className="mt-2 text-sm text-ink-500">Create your account to start learning</p>
        </div>
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-error-100 text-error-600 rounded-xl text-sm font-medium text-center">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5 ml-1">Full Name</label>
              <input
                name="name"
                type="text"
                required
                className="appearance-none relative block w-full px-4 py-3 bg-white/50 border border-ink-200 placeholder-ink-400 text-ink-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all sm:text-sm shadow-sm"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5 ml-1">Role</label>
                <select
                  name="role"
                  required
                  className="appearance-none relative block w-full px-4 py-3 bg-white/50 border border-ink-200 text-ink-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all sm:text-sm shadow-sm bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394A3B8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[position:right_10px_center] bg-[length:1em]"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-accent-500 hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-400 shadow-md transition-all duration-200 active:scale-[0.98]"
            >
              Sign up
            </button>
          </div>
          <div className="text-sm text-center pt-2">
            <Link
              to="/login"
              className="font-semibold text-accent-500 hover:text-accent-600 transition-colors"
            >
              Already have an account? <span className="underline decoration-accent-300 underline-offset-4">Sign in</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
