import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, ThumbsUp, Flag, Send, ChevronDown, ChevronUp } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
  parent_id: string | null;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  teacher_name: string;
  published_at: string;
  upvotes: number;
  comments?: Comment[];
}

interface Doubt {
  id: string;
  title: string;
  content: string;
  student_name: string;
  created_at: string;
  upvotes: number;
  subject_tag: string;
}

function BlogCard({ blog }: { blog: BlogPost }) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [upvotes, setUpvotes] = useState(blog.upvotes);

  const loadComments = async () => {
    if (loading || (open && comments.length > 0)) return;
    setLoading(true);
    try {
      const res = await api.get(`/community/blogs/${blog.id}`);
      setComments(res.data.comments || []);
    } catch (e) {
      console.error('Failed to load comments', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) loadComments();
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/community/blogs/${blog.id}/comment`, { content: replyText });
      setComments(prev => [...prev, { ...res.data, author_name: 'You' }]);
      setReplyText('');
    } catch (e) {
      console.error('Failed to post comment', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async () => {
    try {
      await api.post(`/community/blogs/${blog.id}/like`);
      setUpvotes(u => u + 1);
    } catch (e) {
      console.error('Failed to like', e);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900">{blog.title}</h3>
        <p className="mt-1 text-sm text-gray-500">
          By {blog.teacher_name} &bull; {new Date(blog.published_at).toLocaleDateString()}
        </p>
        <div className="mt-4 text-gray-700 whitespace-pre-wrap leading-relaxed">{blog.content}</div>
        <div className="mt-5 flex items-center space-x-4 text-sm text-gray-500">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
          >
            <ThumbsUp className="w-4 h-4" /> {upvotes}
          </button>
          <button
            onClick={handleToggle}
            className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Reply
            {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <button className="flex items-center gap-1 hover:text-red-600 ml-auto transition-colors">
            <Flag className="w-4 h-4" /> Flag
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-5 space-y-4">
          {loading ? (
            <p className="text-sm text-gray-400">Loading comments…</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No replies yet. Be the first!</p>
          ) : (
            <div className="space-y-3">
              {comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                    {c.author_name[0]?.toUpperCase()}
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 px-3 py-2 flex-1">
                    <p className="text-xs font-semibold text-gray-700">{c.author_name}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{c.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(c.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply form */}
          <form onSubmit={handleReply} className="flex gap-2 mt-3">
            <input
              type="text"
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Write a reply…"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={submitting || !replyText.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4 mr-1" />
              {submitting ? 'Sending…' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function DoubtCard({ doubt }: { doubt: Doubt }) {
  const [open, setOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [upvotes, setUpvotes] = useState(doubt.upvotes);
  const [replies, setReplies] = useState<Comment[]>([]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/community/doubts/${doubt.id}/reply`, { content: replyText });
      setReplies(prev => [...prev, { ...res.data, author_name: 'You' }]);
      setReplyText('');
    } catch (e) {
      console.error('Failed to reply', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async () => {
    try {
      await api.post(`/community/doubts/${doubt.id}/upvote`);
      setUpvotes(u => u + 1);
    } catch (e) {
      console.error('Failed to upvote', e);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900">{doubt.title}</h3>
        <p className="mt-1 text-sm text-gray-500">
          By {doubt.student_name} &bull; {new Date(doubt.created_at).toLocaleDateString()}
        </p>
        <div className="mt-3 text-gray-700">{doubt.content}</div>
        <div className="mt-4 flex items-center gap-3 text-sm text-gray-500 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {doubt.subject_tag}
          </span>
          <button onClick={handleUpvote} className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
            <ThumbsUp className="w-4 h-4" /> {upvotes}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Reply
            {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-5 space-y-4">
          {replies.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No answers yet.</p>
          ) : (
            <div className="space-y-3">
              {replies.map(r => (
                <div key={r.id} className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700">
                    {r.author_name[0]?.toUpperCase()}
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 px-3 py-2 flex-1">
                    <p className="text-xs font-semibold text-gray-700">{r.author_name}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{r.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleReply} className="flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Write an answer…"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={submitting || !replyText.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4 mr-1" />
              {submitting ? 'Sending…' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function Forum() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [activeTab, setActiveTab] = useState<'blogs' | 'doubts'>('blogs');
  const [newDoubt, setNewDoubt] = useState({ title: '', content: '', subject_tag: '' });
  const { user } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const [blogsRes, doubtsRes] = await Promise.all([
          api.get('/community/blogs'),
          api.get('/community/doubts'),
        ]);
        setBlogs(blogsRes.data);
        setDoubts(doubtsRes.data);
      } catch (error) {
        console.error('Failed to fetch forum posts', error);
      }
    };
    fetchPosts();
  }, []);

  const handleDoubtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/community/doubts', newDoubt);
      setDoubts(prev => [res.data, ...prev]);
      setNewDoubt({ title: '', content: '', subject_tag: '' });
    } catch (error) {
      console.error('Failed to post doubt', error);
    }
  };

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Community Forum</h1>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('blogs')}
            className={`${activeTab === 'blogs'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Teacher Blogs
          </button>
          <button
            onClick={() => setActiveTab('doubts')}
            className={`${activeTab === 'doubts'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Student Doubts
          </button>
        </nav>
      </div>

      {activeTab === 'blogs' && (
        <div className="space-y-6">
          {blogs.length === 0 && <p className="text-gray-500 italic">No blog posts yet.</p>}
          {blogs.map(blog => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}

      {activeTab === 'doubts' && (
        <div className="space-y-6">
          {user?.role === 'student' && (
            <form
              onSubmit={handleDoubtSubmit}
              className="bg-white shadow sm:rounded-lg border border-gray-200 p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ask a Doubt</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  required
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={newDoubt.title}
                  onChange={e => setNewDoubt({ ...newDoubt, title: e.target.value })}
                />
                <textarea
                  placeholder="Describe your doubt..."
                  required
                  rows={3}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={newDoubt.content}
                  onChange={e => setNewDoubt({ ...newDoubt, content: e.target.value })}
                />
                <select
                  required
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={newDoubt.subject_tag}
                  onChange={e => setNewDoubt({ ...newDoubt, subject_tag: e.target.value })}
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
                <button
                  type="submit"
                  className="inline-flex items-center justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Publish Post
                </button>
              </div>
            </form>
          )}

          {doubts.length === 0 && <p className="text-gray-500 italic">No doubts posted yet.</p>}
          {doubts.map(doubt => (
            <DoubtCard key={doubt.id} doubt={doubt} />
          ))}
        </div>
      )}
    </div>
  );
}
