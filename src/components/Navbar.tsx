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
    <nav className="sticky top-0 z-50 bg-slate-900 backdrop-blur-md border-b border-slate-800 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left: Logo + Nav links */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center mr-6 group">
              <BookOpen className="h-8 w-8 text-amber-500 group-hover:text-amber-400 transition-colors" />
              <span className="ml-2 text-xl font-bold text-white">EduGap AI</span>
            </Link>

            <div className="hidden sm:flex sm:space-x-2 items-center">
              {/* Domains dropdown — visible to all roles */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDomainOpen(prev => !prev)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-400 rounded-md hover:text-amber-500 hover:bg-slate-800 transition-all duration-200"
                >
                  <LayoutGrid className="w-4 h-4" />
                  Domains
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${domainOpen ? 'rotate-180 text-amber-500' : 'text-slate-500'}`} />
                </button>

                {domainOpen && (
                  <div className="absolute left-0 mt-2 w-64 rounded-xl shadow-xl shadow-slate-900/50 bg-white ring-1 ring-slate-200 z-50 overflow-hidden transform origin-top transition-all">
                    <div className="py-1">
                      {domains.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-slate-400">Loading…</p>
                      ) : (
                        domains.map(d => (
                          <Link
                            key={d.id}
                            to={user.role === 'student' ? `/student/domains/${d.id}/topics` : `/student/domains`}
                            className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-amber-500 transition-colors"
                            onClick={() => setDomainOpen(false)}
                          >
                            <span className="font-medium">{d.name}</span>
                          </Link>
                        ))
                      )}
                      {user.role === 'student' && (
                        <div className="border-t border-slate-100 mt-1 pt-1">
                          <Link
                            to="/student/domains"
                            className="flex items-center px-4 py-2.5 text-sm text-amber-600 font-semibold hover:bg-amber-50 transition-colors"
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
                className="px-3 py-2 text-sm font-semibold text-slate-400 rounded-md hover:text-amber-500 hover:bg-slate-800 transition-all duration-200"
              >
                Forum
              </Link>

              {user.role === 'teacher' && (
                <Link
                  to="/teacher/dashboard"
                  className="px-3 py-2 text-sm font-semibold text-slate-400 rounded-md hover:text-amber-500 hover:bg-slate-800 transition-all duration-200"
                >
                  Dashboard
                </Link>
              )}

              {user.role === 'admin' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className="px-3 py-2 text-sm font-semibold text-slate-400 rounded-md hover:text-amber-500 hover:bg-slate-800 transition-all duration-200"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/topics"
                    className="px-3 py-2 text-sm font-semibold text-slate-400 rounded-md hover:text-amber-500 hover:bg-slate-800 transition-all duration-200"
                  >
                    Manage Topics
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right: User info + Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center text-sm font-medium text-slate-300 gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 shadow-sm flex items-center justify-center text-sm font-bold text-amber-500">
                {user.name[0]?.toUpperCase()}
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-white">{user.name}</span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{user.role}</span>
              </div>
            </div>
            <div className="h-6 w-px bg-slate-700 mx-1 hidden sm:block"></div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 text-sm font-semibold shadow-sm rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 focus:ring-amber-500 transition-all duration-200 active:scale-95"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
