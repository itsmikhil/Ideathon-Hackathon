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
  beginner: 'bg-success-100 text-success-600 border border-success-200/60',
  intermediate: 'bg-warning-100 text-warning-600 border border-warning-200/60',
  advanced: 'bg-error-100 text-error-600 border border-error-200/60',
};

function TopicCard({
  topic,
  onDemand,
}: {
  topic: Topic;
  onDemand: (id: string, curr: boolean) => void | Promise<void>;
  key?: React.Key;
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
      className={`bg-white rounded-2xl transition-all duration-300 ${topic.is_vit_available ? 'border border-ink-200 shadow-sm hover:shadow-md' : 'border border-ink-200/50 shadow-sm opacity-[0.85] hover:opacity-100'
        }`}
    >
      <div className="px-5 py-5 sm:px-6 flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg leading-6 font-bold text-ink-900 flex flex-wrap items-center gap-2">
            {topic.title}
            {topic.is_vit_available ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-success-100 text-success-600 border border-success-200">
                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Available at VIT
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-ink-100 text-ink-600 border border-ink-200">
                <XCircle className="w-3.5 h-3.5 mr-1" /> Not offered
              </span>
            )}
          </h3>
          {topic.vit_subject_name && (
            <p className="text-sm font-medium text-accent-600 mt-1.5 flex items-center gap-1.5"><Book className="w-4 h-4" /> {topic.vit_subject_name}</p>
          )}
          <p className="mt-2 text-sm text-ink-600 leading-relaxed">{topic.description}</p>
        </div>
        <span
          className={`shrink-0 inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${DIFFICULTY_COLORS[topic.difficulty] || 'bg-ink-100 text-ink-700 border border-ink-200'
            }`}
        >
          {topic.difficulty}
        </span>
      </div>
      <div className="border-t border-ink-100 px-5 py-4 sm:px-6 bg-ink-50/50 flex flex-wrap gap-3 items-center rounded-b-2xl">
        {!topic.is_vit_available && (
          <button
            onClick={() => onDemand(topic.id, topic.demanded || false)}
            className={`inline-flex items-center px-4 py-2 border text-sm font-bold rounded-xl transition-all duration-200 active:scale-95 ${topic.demanded
              ? 'bg-warning-100 border-warning-200 text-warning-700 hover:bg-warning-200 hover:border-warning-300'
              : 'bg-white border-ink-200 text-ink-700 hover:bg-warning-50 hover:border-warning-200 hover:text-warning-700'
              }`}
          >
            {topic.demanded ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Requested for VIT
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-1.5" />
                I want this in VIT
              </>
            )}
          </button>
        )}
        <button
          onClick={handleResourceClick}
          className="inline-flex items-center px-4 py-2 border border-ink-200 text-sm font-bold rounded-xl text-ink-700 bg-white hover:bg-accent-50 hover:border-accent-200 hover:text-accent-600 transition-all duration-200 active:scale-95 shadow-sm"
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
        <div className="border-t border-accent-100 bg-accent-50/50 px-5 py-5 sm:px-6 rounded-b-2xl">
          {loadingRes ? (
            <div className="flex items-center gap-2 text-sm font-medium text-accent-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              AI is finding the best free resources...
            </div>
          ) : resources.length === 0 ? (
            <p className="text-sm text-ink-500 italic">No resources found.</p>
          ) : (
            <div className="space-y-4">
              <p className="text-[11px] font-extrabold text-accent-600 uppercase tracking-widest mb-1">
                Top Free Resources ✨
              </p>
              {resources.map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 bg-white rounded-xl border border-accent-100/60 hover:border-accent-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="shrink-0 w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center text-sm font-bold text-accent-600">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-ink-900 group-hover:text-accent-600 transition-colors truncate">
                        {r.title}
                      </span>
                      <span className="shrink-0 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-success-50 text-success-700 border border-success-100">
                        {r.platform}
                      </span>
                      {r.is_free && (
                        <span className="shrink-0 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-accent-50 text-accent-600 border border-accent-100">
                          Free
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-ink-500 mt-1 leading-snug line-clamp-2">{r.description}</p>
                    <p className="text-xs font-medium text-accent-400 mt-1.5 truncate group-hover:text-accent-500 transition-colors">{r.url}</p>
                  </div>
                  <ExternalLink className="shrink-0 w-5 h-5 text-ink-300 group-hover:text-accent-500 mt-1 transition-colors" />
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
      <div className="flex flex-col justify-center items-center h-64 gap-3 text-ink-500">
        <Loader2 className="animate-spin rounded-full h-8 w-8 text-accent-600" />
        <span>Loading courses for this domain...</span>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-ink-900 tracking-tight">Your Learning Roadmap</h1>
        <p className="mt-3 text-lg text-ink-500">Discover topics to study mapped across your university curriculum and the latest industry trends.</p>
      </div>

      {/* VIT Curriculum Subjects */}
      <section>
        <div className="flex items-center gap-3 mb-6 pb-2 border-b border-ink-200">
          <Book className="w-6 h-6 text-accent-600" />
          <h2 className="text-2xl font-bold text-ink-800">VIT Curriculum Subjects</h2>
          <span className="ml-2 px-2.5 py-1 rounded-lg bg-accent-50 border border-accent-100 text-accent-700 text-xs font-bold uppercase tracking-widest">
            {vitTopics.length} subjects
          </span>
        </div>
        {vitTopics.length === 0 ? (
          <p className="text-sm text-ink-500 italic bg-white p-6 rounded-2xl border border-ink-200 border-dashed text-center">No VIT curriculum subjects loaded yet.</p>
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
        <div className="flex items-center gap-3 mb-6 pb-2 border-b border-ink-200">
          <Sparkles className="w-6 h-6 text-warning-600" />
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-ink-800">AI Suggested for You</h2>
              <span className="px-2.5 py-1 rounded-lg bg-warning-50 border border-warning-100 text-warning-700 text-xs font-bold uppercase tracking-widest">
                {aiTopics.length} courses
              </span>
            </div>
          </div>
        </div>
        <p className="text-[15px] font-medium text-ink-500 mb-6 bg-warning-50/50 p-4 rounded-xl border border-warning-100/50">
          Courses highly relevant to your domain that aren't yet in the VIT curriculum. Request them to show demand!
        </p>
        {aiTopics.length === 0 ? (
          <p className="text-sm text-ink-500 italic bg-white p-6 rounded-2xl border border-ink-200 border-dashed text-center">AI suggestions are being generated…</p>
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
