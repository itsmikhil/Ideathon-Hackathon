import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import { Book, CheckCircle, ExternalLink, Sparkles, XCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface Topic {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  is_vit_available: boolean;
  vit_subject_name?: string;
  source: 'vit' | 'ai' | 'both';
  demanded?: boolean;
}

interface Resource {
  id: string;
  title: string;
  url: string;
  platform: string;
  description: string;
  is_free: boolean;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-blue-100 text-blue-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

function TopicCard({
  topic,
  onDemand,
}: {
  topic: Topic;
  onDemand: (id: string, curr: boolean) => void | Promise<void>;
}) {
  const [showResources, setShowResources] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingRes, setLoadingRes] = useState(false);
  const [resLoaded, setResLoaded] = useState(false);

  const handleResourceClick = async () => {
    const next = !showResources;
    setShowResources(next);
    if (next && !resLoaded) {
      setLoadingRes(true);
      try {
        const res = await api.get(`/topics/${topic.id}/resources`);
        setResources(res.data);
        setResLoaded(true);
      } catch (e) {
        console.error('Failed to load resources', e);
      } finally {
        setLoadingRes(false);
      }
    }
  };

  return (
    <div
      className={`bg-white shadow overflow-hidden sm:rounded-lg border ${topic.is_vit_available ? 'border-gray-200' : 'border-gray-200 opacity-75'
        }`}
    >
      <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="text-base leading-6 font-semibold text-gray-900 flex flex-wrap items-center gap-2">
            {topic.title}
            {topic.is_vit_available ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" /> Available at VIT
              </span>
            ) : topic.source !== 'ai' ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                <XCircle className="w-3 h-3 mr-1" /> Not currently offered
              </span>
            ) : null}
          </h3>
          {topic.vit_subject_name && (
            <p className="text-xs text-indigo-600 mt-0.5">VIT Subject: {topic.vit_subject_name}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">{topic.description}</p>
        </div>
        <span
          className={`shrink-0 ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[topic.difficulty] || 'bg-gray-100 text-gray-700'
            }`}
        >
          {topic.difficulty}
        </span>
      </div>
      <div className="border-t border-gray-100 px-4 py-3 sm:px-6 bg-gray-50 flex flex-wrap gap-3 items-center">
        {topic.source !== 'ai' && !topic.is_vit_available && (
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-indigo-600"
              checked={topic.demanded || false}
              onChange={() => onDemand(topic.id, topic.demanded || false)}
            />
            <span className="ml-2 text-sm text-gray-700 font-medium">I want this at VIT</span>
          </label>
        )}
        <button
          onClick={handleResourceClick}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-700 transition-colors"
        >
          {loadingRes ? (
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
          ) : (
            <ExternalLink className="w-4 h-4 mr-1.5" />
          )}
          Online Resources
          {showResources ? (
            <ChevronUp className="w-3 h-3 ml-1" />
          ) : (
            <ChevronDown className="w-3 h-3 ml-1" />
          )}
        </button>
      </div>

      {/* Resource panel */}
      {showResources && (
        <div className="border-t border-indigo-50 bg-indigo-50 px-4 py-4 sm:px-6">
          {loadingRes ? (
            <div className="flex items-center gap-2 text-sm text-indigo-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Finding best free resources via AI...
            </div>
          ) : resources.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No resources found.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">
                Top Free Resources ✨
              </p>
              {resources.map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 bg-white rounded-md border border-indigo-100 hover:border-indigo-400 hover:shadow-sm transition-all group"
                >
                  <div className="shrink-0 w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-700 truncate">
                        {r.title}
                      </span>
                      <span className="shrink-0 text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                        {r.platform}
                      </span>
                      {r.is_free && (
                        <span className="shrink-0 text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">
                          Free
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{r.description}</p>
                    <p className="text-xs text-indigo-400 mt-0.5 truncate">{r.url}</p>
                  </div>
                  <ExternalLink className="shrink-0 w-4 h-4 text-gray-400 group-hover:text-indigo-500 mt-0.5" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TopicList() {
  const { id } = useParams();
  const [vitTopics, setVitTopics] = useState<Topic[]>([]);
  const [aiTopics, setAiTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await api.get(`/domains/${id}/topics`);
        setVitTopics(response.data.vitTopics || []);
        setAiTopics(response.data.aiTopics || []);
      } catch (error) {
        console.error('Failed to fetch topics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [id]);

  const handleDemand = async (topicId: string, currentDemand: boolean) => {
    try {
      if (currentDemand) {
        await api.delete(`/topics/${topicId}/demand`);
      } else {
        await api.post(`/topics/${topicId}/demand`);
      }
      setVitTopics(vitTopics.map(t => (t.id === topicId ? { ...t, demanded: !currentDemand } : t)));
      setAiTopics(aiTopics.map(t => (t.id === topicId ? { ...t, demanded: !currentDemand } : t)));
    } catch (error) {
      console.error('Failed to record demand', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3 text-gray-500">
        <Loader2 className="animate-spin rounded-full h-8 w-8 text-indigo-600" />
        <span>Loading courses for this domain...</span>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-10">
      <h1 className="text-3xl font-bold text-gray-900">Your Learning Roadmap</h1>

      {/* VIT Curriculum Subjects */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Book className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-800">VIT Curriculum Subjects</h2>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
            {vitTopics.length} subjects
          </span>
        </div>
        {vitTopics.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No VIT curriculum subjects loaded yet.</p>
        ) : (
          <div className="space-y-4">
            {vitTopics.map(topic => (
              <TopicCard key={topic.id} topic={topic} onDemand={handleDemand} />
            ))}
          </div>
        )}
      </section>

      {/* AI Suggested Courses */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-semibold text-gray-800">AI Suggested for You</h2>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
            {aiTopics.length} courses
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Courses highly relevant to your domain that aren't yet in the VIT curriculum.
        </p>
        {aiTopics.length === 0 ? (
          <p className="text-sm text-gray-500 italic">AI suggestions are being generated…</p>
        ) : (
          <div className="space-y-4">
            {aiTopics.map(topic => (
              <TopicCard key={topic.id} topic={topic} onDemand={handleDemand} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
