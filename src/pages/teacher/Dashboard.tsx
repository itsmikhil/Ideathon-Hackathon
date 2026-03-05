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
    <div className="py-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="h-6 w-6 text-indigo-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Points</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{points.total}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-indigo-600" />
          Publish New Blog Post
        </h3>
        <form onSubmit={handleBlogSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            required
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={newBlog.title}
            onChange={e => setNewBlog({ ...newBlog, title: e.target.value })}
          />
          <textarea
            placeholder="Content (Markdown supported)"
            required
            rows={5}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={newBlog.content}
            onChange={e => setNewBlog({ ...newBlog, content: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <select
              required
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2"
              value={newBlog.subject_tag}
              onChange={e => setNewBlog({ ...newBlog, subject_tag: e.target.value })}
            >
              <option value="">Select Subject Tag</option>
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
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2"
              value={newBlog.difficulty_tag}
              onChange={e => setNewBlog({ ...newBlog, difficulty_tag: e.target.value })}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Publish Post
          </button>
        </form>
      </div>

      <div className="bg-white shadow sm:rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-indigo-600" />
          Most Active Students in Your Subjects
        </h3>
        <ul className="divide-y divide-gray-200">
          {activeStudents.map(student => (
            <li key={student.id} className="py-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">{student.name}</span>
                <span className="text-sm text-gray-500">{student.interactions} interactions</span>
              </div>
              <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
                Contact
              </button>
            </li>
          ))}
          {activeStudents.length === 0 && (
            <li className="py-4 text-sm text-gray-500">No active students found yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
