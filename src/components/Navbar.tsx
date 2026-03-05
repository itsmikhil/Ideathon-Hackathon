import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ChevronDown, LayoutGrid, LogOut, User } from 'lucide-react';
import api from '../api/axios';

interface Domain {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [domainOpen, setDomainOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      api.get('/domains').then(res => setDomains(res.data)).catch(() => { });
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDomainOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left: Logo + Nav links */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center mr-6">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">EduGap AI</span>
            </Link>

            <div className="hidden sm:flex sm:space-x-6 items-center">
              {/* Domains dropdown — visible to all roles */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDomainOpen(prev => !prev)}
                  className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-indigo-600 py-2 transition-colors"
                >
                  <LayoutGrid className="w-4 h-4" />
                  Domains
                  <ChevronDown className={`w-4 h-4 transition-transform ${domainOpen ? 'rotate-180' : ''}`} />
                </button>

                {domainOpen && (
                  <div className="absolute left-0 mt-1 w-64 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
                    <div className="py-1">
                      {domains.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-400">Loading…</p>
                      ) : (
                        domains.map(d => (
                          <Link
                            key={d.id}
                            to={user.role === 'student' ? `/student/domains/${d.id}/topics` : `/student/domains`}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                            onClick={() => setDomainOpen(false)}
                          >
                            <span className="font-medium">{d.name}</span>
                          </Link>
                        ))
                      )}
                      {user.role === 'student' && (
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <Link
                            to="/student/domains"
                            className="flex items-center px-4 py-2.5 text-sm text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors"
                            onClick={() => setDomainOpen(false)}
                          >
                            Browse all domains →
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/community"
                className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Forum
              </Link>

              {user.role === 'teacher' && (
                <Link
                  to="/teacher/dashboard"
                  className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Dashboard
                </Link>
              )}

              {user.role === 'admin' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/topics"
                    className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    Manage Topics
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right: User info + Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center text-sm font-medium text-gray-500 gap-1.5">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                {user.name[0]?.toUpperCase()}
              </div>
              <span>{user.name}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 capitalize">{user.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
