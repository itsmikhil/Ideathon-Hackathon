import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { BarChart, Users, AlertTriangle, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const [domainInterest, setDomainInterest] = useState<any[]>([]);
  const [topicDemand, setTopicDemand] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [flaggedContent, setFlaggedContent] = useState<any>({ blogs: [], doubts: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const diRes = await api.get('/admin/domain-interest');
        setDomainInterest(diRes.data);
        const tdRes = await api.get('/admin/topic-demand');
        setTopicDemand(tdRes.data);
        const lbRes = await api.get('/admin/teachers/leaderboard');
        setLeaderboard(lbRes.data);
        const fcRes = await api.get('/admin/flagged-content');
        setFlaggedContent(fcRes.data);
      } catch (error) {
        console.error('Failed to fetch admin data', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-ink-900 tracking-tight">Admin Overview</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="bg-white/95 backdrop-blur-sm shadow-sm rounded-3xl border border-ink-200/60 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-ink-900 mb-6 flex items-center">
            <div className="p-2 bg-accent-50 text-accent-600 rounded-xl mr-3">
              <BarChart className="h-5 w-5" />
            </div>
            Student Domain Interest
          </h3>
          <ul className="divide-y divide-ink-100">
            {domainInterest.map(domain => (
              <li key={domain.name} className="py-4 flex justify-between items-center group">
                <span className="text-sm font-semibold text-ink-700 group-hover:text-accent-600 transition-colors">{domain.name}</span>
                <span className="text-xs font-bold px-3 py-1 bg-ink-100 text-ink-600 rounded-lg">{domain.count} students</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white/95 backdrop-blur-sm shadow-sm rounded-3xl border border-ink-200/60 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-ink-900 mb-6 flex items-center">
            <div className="p-2 bg-accent-50 text-accent-600 rounded-xl mr-3">
              <Users className="h-5 w-5" />
            </div>
            Teacher Leaderboard
          </h3>
          <ul className="divide-y divide-ink-100">
            {leaderboard.map(teacher => (
              <li key={teacher.id} className="py-4 flex justify-between items-center group">
                <span className="text-sm font-semibold text-ink-700 group-hover:text-accent-600 transition-colors">{teacher.name}</span>
                <span className="text-xs font-bold px-3 py-1 bg-accent-50 text-accent-700 rounded-lg">{teacher.total_points} pts</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white/95 backdrop-blur-sm shadow-sm rounded-3xl border border-ink-200/60 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-ink-900 mb-6 flex items-center">
            <div className="p-2 bg-warning-50 text-warning-600 rounded-xl mr-3">
              <RefreshCw className="h-5 w-5" />
            </div>
            Topic Demand (Not in VIT)
          </h3>
          {topicDemand.length === 0 ? (
            <p className="text-sm text-ink-500 italic py-4">No topic demands recorded yet.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {topicDemand.map((topic, idx) => {
                const maxDemand = Math.max(...topicDemand.map(t => Number(t.demand_count) || 0));
                const currentDemand = Number(topic.demand_count) || 0;
                const percentage = maxDemand > 0 ? (currentDemand / maxDemand) * 100 : 0;

                return (
                  <li key={`${topic.title}-${idx}`} className="py-4 flex flex-col gap-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-sm font-bold text-ink-900">{topic.title}</span>
                        <div className="mt-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-warning-50 text-warning-700 border border-warning-100/50">
                            {topic.domain_name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center bg-ink-50 px-3 py-1.5 rounded-xl border border-ink-100 shadow-sm">
                        <span className="text-sm font-extrabold text-warning-700">{currentDemand}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400 ml-1.5">votes</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-ink-100 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-warning-400 to-warning-600 h-1.5 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="bg-white/95 backdrop-blur-sm shadow-sm rounded-3xl border border-ink-200/60 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-ink-900 mb-6 flex items-center">
            <div className="p-2 bg-error-50 text-error-600 rounded-xl mr-3">
              <AlertTriangle className="h-5 w-5" />
            </div>
            Flagged Content
          </h3>
          <div className="space-y-4">
            {flaggedContent.blogs.map((blog: any) => (
              <div key={blog.id} className="p-5 bg-error-50/50 rounded-2xl border border-error-100/60">
                <h4 className="text-sm font-bold text-error-800">Blog: {blog.title}</h4>
                <p className="text-sm text-error-600/80 mt-1.5 leading-snug">{blog.content.substring(0, 100)}...</p>
                <button className="mt-3 text-xs font-bold text-error-700 hover:text-error-900 uppercase tracking-wider px-3 py-1.5 bg-error-100/50 hover:bg-error-200 rounded-lg transition-colors">
                  Remove Post
                </button>
              </div>
            ))}
            {flaggedContent.doubts.map((doubt: any) => (
              <div key={doubt.id} className="p-5 bg-error-50/50 rounded-2xl border border-error-100/60">
                <h4 className="text-sm font-bold text-error-800">Doubt: {doubt.title}</h4>
                <p className="text-sm text-error-600/80 mt-1.5 leading-snug">{doubt.content.substring(0, 100)}...</p>
                <button className="mt-3 text-xs font-bold text-error-700 hover:text-error-900 uppercase tracking-wider px-3 py-1.5 bg-error-100/50 hover:bg-error-200 rounded-lg transition-colors">
                  Remove Doubt
                </button>
              </div>
            ))}
            {flaggedContent.blogs.length === 0 && flaggedContent.doubts.length === 0 && (
              <p className="text-sm text-ink-500 italic">No flagged content.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
