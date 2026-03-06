import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Award, Users, FileText } from 'lucide-react';

export default function TeacherDashboard() {
  const [points, setPoints] = useState<any>({ total: 0, breakdown: [] });
  const [activeStudents, setActiveStudents] = useState<any[]>([]);
  const [newBlog, setNewBlog] = useState({ title: '', content: '', subject_tag: '', difficulty_tag: 'beginner' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pointsRes = await api.get('/teacher/points');
        setPoints(pointsRes.data);
        const studentsRes = await api.get('/teacher/active-students');
        setActiveStudents(studentsRes.data);
      } catch (error) {
        console.error('Failed to fetch teacher data', error);
      }
    };
    fetchData();
  }, []);

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/teacher/blogs', newBlog);
      setNewBlog({ title: '', content: '', subject_tag: '', difficulty_tag: 'beginner' });
      // Refresh points
      const pointsRes = await api.get('/teacher/points');
      setPoints(pointsRes.data);
    } catch (error) {
      console.error('Failed to post blog', error);
    }
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Teacher Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-3xl border border-slate-200/60 p-6 sm:p-8 flex items-center transition-all hover:shadow-md">
          <div className="flex-shrink-0 p-4 bg-indigo-50 rounded-2xl">
            <Award className="h-8 w-8 text-indigo-600" aria-hidden="true" />
          </div>
          <div className="ml-6 flex-1">
            <dl>
              <dt className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Points</dt>
              <dd>
                <div className="text-3xl font-extrabold text-indigo-700 mt-1">{points.total}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-3xl border border-slate-200/60 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl mr-3">
              <FileText className="h-5 w-5" />
            </div>
            Publish New Blog Post
          </h3>
          <form onSubmit={handleBlogSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              required
              className="block w-full border border-slate-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-slate-50/50"
              value={newBlog.title}
              onChange={e => setNewBlog({ ...newBlog, title: e.target.value })}
            />
            <textarea
              placeholder="Content (Markdown supported)"
              required
              rows={5}
              className="block w-full border border-slate-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-slate-50/50 resize-y"
              value={newBlog.content}
              onChange={e => setNewBlog({ ...newBlog, content: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                required
                className="block w-full border border-slate-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-slate-50/50 cursor-pointer"
                value={newBlog.subject_tag}
                onChange={e => setNewBlog({ ...newBlog, subject_tag: e.target.value })}
              >
                <option value="">Select Subject</option>
                <option value="Data Structures and Algorithms">Data Structures and Algorithms</option>
                <option value="Database Management Systems">Database Management Systems</option>
                <option value="Operating Systems">Operating Systems</option>
                <option value="Computer Networks">Computer Networks</option>
                <option value="Web Technologies">Web Technologies</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="Deep Learning">Deep Learning</option>
                <option value="Natural Language Processing">Natural Language Processing</option>
                <option value="Computer Vision">Computer Vision</option>
                <option value="Data Mining">Data Mining</option>
                <option value="Big Data Analytics">Big Data Analytics</option>
                <option value="Probability and Statistics">Probability and Statistics</option>
                <option value="Cloud Computing">Cloud Computing</option>
                <option value="Network Security">Network Security</option>
                <option value="Cryptography and Network Security">Cryptography and Network Security</option>
                <option value="Ethical Hacking">Ethical Hacking</option>
                <option value="Human Computer Interaction">Human Computer Interaction</option>
                <option value="Mobile Application Development">Mobile Application Development</option>
                <option value="Object Oriented Programming">Object Oriented Programming</option>
              </select>
              <select
                className="block w-full border border-slate-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-slate-50/50 cursor-pointer"
                value={newBlog.difficulty_tag}
                onChange={e => setNewBlog({ ...newBlog, difficulty_tag: e.target.value })}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <button type="submit" className="w-full inline-flex justify-center items-center py-3 px-4 border border-transparent shadow-sm shadow-indigo-500/30 text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 active:scale-[0.98]">
              Publish Post
            </button>
          </form>
        </div>

        <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-3xl border border-slate-200/60 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl mr-3">
              <Users className="h-5 w-5" />
            </div>
            Most Active Students
          </h3>
          <ul className="divide-y divide-slate-100">
            {activeStudents.map(student => (
              <li key={student.id} className="py-4 flex items-center justify-between group">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{student.name}</span>
                  <span className="text-xs font-semibold text-slate-500 mt-0.5">{student.interactions} interactions</span>
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors active:scale-95">
                  Contact
                </button>
              </li>
            ))}
            {activeStudents.length === 0 && (
              <li className="py-8 text-sm text-slate-500 text-center italic border-2 border-dashed border-slate-200 rounded-2xl">No active students found yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
