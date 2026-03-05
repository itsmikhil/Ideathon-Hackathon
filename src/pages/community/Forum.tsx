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
    <div className="bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden rounded-3xl border border-slate-200/60 transition-all hover:shadow-md">
      <div className="p-6 sm:p-8">
        <h3 className="text-xl font-extrabold text-slate-800">{blog.title}</h3>
        <p className="mt-2 text-sm font-medium text-slate-500 flex items-center gap-2">
          By <span className="text-slate-700 font-bold">{blog.teacher_name}</span> &bull; {new Date(blog.published_at).toLocaleDateString()}
        </p>
        <div className="mt-5 text-slate-600 whitespace-pre-wrap leading-relaxed">{blog.content}</div>
        <div className="mt-6 pt-4 flex items-center gap-3 text-sm font-semibold text-slate-500 border-t border-slate-100/50">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-500 transition-colors active:scale-95"
          >
            <ThumbsUp className="w-4 h-4" /> {upvotes}
          </button>
          <button
            onClick={handleToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors active:scale-95 ${open ? 'bg-amber-50 text-amber-500' : 'text-slate-400 hover:bg-amber-50 hover:text-amber-500'}`}
          >
            <MessageSquare className="w-4 h-4" />
            Reply
            {open ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 ml-auto transition-colors">
            <Flag className="w-4 h-4" /> Flag
          </button>
        </div>
      </div>

      {open && (
        <div className="bg-slate-50/50 px-6 sm:px-8 py-6 space-y-6">
          {loading ? (
            <div className="flex justify-center"><div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-slate-400 italic text-center">No replies yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {comments.map(c => (
                <div key={c.id} className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-sm font-extrabold text-slate-700 shadow-sm border border-slate-200/50">
                    {c.author_name[0]?.toUpperCase()}
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm border border-slate-200/60 px-4 py-3 flex-1 relative">
                    <p className="text-xs font-bold text-slate-800">{c.author_name}</p>
                    <p className="text-sm text-slate-600 mt-1">{c.content}</p>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-2">{new Date(c.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply form */}
          <form onSubmit={handleReply} className="flex gap-3 mt-4 relative">
            <input
              type="text"
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Write a reply…"
              className="flex-1 border border-slate-200 bg-white rounded-2xl px-5 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
            />
            <button
              type="submit"
              disabled={submitting || !replyText.trim()}
              className="inline-flex items-center justify-center w-12 h-12 shrink-0 border border-transparent rounded-2xl text-slate-900 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md"
            >
              <Send className="w-5 h-5 ml-[-2px]" />
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
    <div className="bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden rounded-3xl border border-slate-200/60 transition-all hover:shadow-md">
      <div className="p-6 sm:p-8">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-extrabold text-slate-800">{doubt.title}</h3>
          <span className="shrink-0 inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            {doubt.subject_tag}
          </span>
        </div>
        <p className="mt-1 text-sm font-medium text-slate-500 flex items-center gap-2">
          By <span className="text-slate-700 font-bold">{doubt.student_name}</span> &bull; {new Date(doubt.created_at).toLocaleDateString()}
        </p>
        <div className="mt-4 text-slate-600 leading-relaxed">{doubt.content}</div>
        <div className="mt-6 pt-4 flex items-center justify-between text-sm font-semibold text-slate-500 border-t border-slate-100/50">
          <div className="flex gap-3">
            <button onClick={handleUpvote} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-500 transition-colors active:scale-95">
              <ThumbsUp className="w-4 h-4" /> {upvotes}
            </button>
            <button
              onClick={() => setOpen(!open)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors active:scale-95 ${open ? 'bg-amber-50 text-amber-500' : 'text-slate-400 hover:bg-amber-50 hover:text-amber-500'}`}
            >
              <MessageSquare className="w-4 h-4" />
              Answers
              {open ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="bg-slate-50/50 px-6 sm:px-8 py-6 space-y-6">
          {replies.length === 0 ? (
            <p className="text-sm text-slate-400 italic text-center">No answers yet.</p>
          ) : (
            <div className="space-y-4">
              {replies.map(r => (
                <div key={r.id} className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-sm font-extrabold text-slate-700 shadow-sm border border-slate-200/50">
                    {r.author_name[0]?.toUpperCase()}
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm border border-slate-200/60 px-4 py-3 flex-1 relative">
                    <p className="text-xs font-bold text-slate-800">{r.author_name}</p>
                    <p className="text-sm text-slate-600 mt-1">{r.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleReply} className="flex gap-3 relative mt-4">
            <input
              type="text"
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Write an answer…"
              className="flex-1 border border-slate-200 bg-white rounded-2xl px-5 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
            />
            <button
              type="submit"
              disabled={submitting || !replyText.trim()}
              className="inline-flex items-center justify-center w-12 h-12 shrink-0 border border-transparent rounded-2xl text-slate-900 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md"
            >
              <Send className="w-5 h-5 ml-[-2px]" />
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
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Community Forum</h1>
        <div className="p-1.5 bg-slate-100 rounded-2xl flex items-center shadow-inner self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('blogs')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'blogs'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Teacher Blogs
          </button>
          <button
            onClick={() => setActiveTab('doubts')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'doubts'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Student Doubts
          </button>
        </div>
      </div>

      {activeTab === 'blogs' && (
        <div className="space-y-6">
          {blogs.length === 0 && <p className="text-slate-500 italic text-center py-10 bg-white/50 rounded-3xl border border-slate-200/50">No blog posts yet.</p>}
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
              className="bg-white/80 backdrop-blur-sm shadow-sm rounded-3xl border border-slate-200/60 p-6 sm:p-8"
            >
              <h3 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center">
                <div className="p-2 bg-amber-50 text-amber-500 rounded-xl mr-3 border border-amber-200">
                  <MessageSquare className="w-5 h-5" />
                </div>
                Ask a Doubt
              </h3>
              <div className="space-y-5">
                <input
                  type="text"
                  placeholder="What is your doubt about?"
                  required
                  className="block w-full border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors bg-white hover:bg-slate-50/50"
                  value={newDoubt.title}
                  onChange={e => setNewDoubt({ ...newDoubt, title: e.target.value })}
                />
                <textarea
                  placeholder="Describe your doubt in detail..."
                  required
                  rows={4}
                  className="block w-full border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors bg-white hover:bg-slate-50/50 resize-y"
                  value={newDoubt.content}
                  onChange={e => setNewDoubt({ ...newDoubt, content: e.target.value })}
                />
                <select
                  required
                  className="block w-full border border-slate-200 rounded-2xl px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors bg-white hover:bg-slate-50/50 cursor-pointer"
                  value={newDoubt.subject_tag}
                  onChange={e => setNewDoubt({ ...newDoubt, subject_tag: e.target.value })}
                >
                  <option value="">Select Related Subject</option>
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
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center items-center py-4 px-6 border border-transparent shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] text-sm font-bold rounded-2xl text-slate-900 bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all active:scale-[0.98]"
                  >
                    Post Doubt
                  </button>
                </div>
              </div>
            </form>
          )}

          {doubts.length === 0 && <p className="text-slate-500 italic text-center py-10 bg-white/50 rounded-3xl border border-slate-200/50">No doubts posted yet.</p>}
          {doubts.map(doubt => (
            <DoubtCard key={doubt.id} doubt={doubt} />
          ))}
        </div>
      )}
    </div>
  );
}
