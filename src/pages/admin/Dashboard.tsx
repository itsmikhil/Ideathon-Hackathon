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
    <div className="py-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow sm:rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
            <BarChart className="h-5 w-5 mr-2 text-indigo-600" />
            Student Domain Interest
          </h3>
          <ul className="divide-y divide-gray-200">
            {domainInterest.map(domain => (
              <li key={domain.name} className="py-4 flex justify-between">
                <span className="text-sm font-medium text-gray-900">{domain.name}</span>
                <span className="text-sm text-gray-500">{domain.count} students</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white shadow sm:rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-indigo-600" />
            Teacher Leaderboard
          </h3>
          <ul className="divide-y divide-gray-200">
            {leaderboard.map(teacher => (
              <li key={teacher.id} className="py-4 flex justify-between">
                <span className="text-sm font-medium text-gray-900">{teacher.name}</span>
                <span className="text-sm text-gray-500">{teacher.total_points} pts</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white shadow sm:rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
            <RefreshCw className="h-5 w-5 mr-2 text-purple-600" />
            Topic Demand (Not in VIT)
          </h3>
          {topicDemand.length === 0 ? (
            <p className="text-sm text-gray-500 italic py-4">No topic demands recorded yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {topicDemand.map((topic, idx) => {
                // Calculate percentage relative to highest demanded topic for the progress bar
                const maxDemand = Math.max(...topicDemand.map(t => Number(t.demand_count) || 0));
                const currentDemand = Number(topic.demand_count) || 0;
                const percentage = maxDemand > 0 ? (currentDemand / maxDemand) * 100 : 0;

                return (
                  <li key={`${topic.title}-${idx}`} className="py-4 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{topic.title}</span>
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-100">
                            {topic.domain_name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center bg-gray-50 px-2 py-1 rounded border border-gray-100">
                        <span className="text-sm font-bold text-purple-700">{currentDemand}</span>
                        <span className="text-xs text-gray-500 ml-1">votes</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className="bg-purple-500 h-1.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="bg-white shadow sm:rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Flagged Content
          </h3>
          <div className="space-y-4">
            {flaggedContent.blogs.map((blog: any) => (
              <div key={blog.id} className="p-4 bg-red-50 rounded-md border border-red-200">
                <h4 className="text-sm font-bold text-red-800">Blog: {blog.title}</h4>
                <p className="text-xs text-red-600 mt-1">{blog.content.substring(0, 100)}...</p>
                <button className="mt-2 text-xs font-medium text-red-700 hover:text-red-900">Remove Post</button>
              </div>
            ))}
            {flaggedContent.doubts.map((doubt: any) => (
              <div key={doubt.id} className="p-4 bg-red-50 rounded-md border border-red-200">
                <h4 className="text-sm font-bold text-red-800">Doubt: {doubt.title}</h4>
                <p className="text-xs text-red-600 mt-1">{doubt.content.substring(0, 100)}...</p>
                <button className="mt-2 text-xs font-medium text-red-700 hover:text-red-900">Remove Doubt</button>
              </div>
            ))}
            {flaggedContent.blogs.length === 0 && flaggedContent.doubts.length === 0 && (
              <p className="text-sm text-gray-500">No flagged content.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
