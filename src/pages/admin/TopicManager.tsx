import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { CheckCircle, XCircle, ChevronDown } from 'lucide-react';

interface Domain {
    id: string;
    name: string;
    slug: string;
}

interface Topic {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    is_vit_available: boolean;
    vit_subject_name?: string;
    source: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
    beginner: 'bg-success-50 text-success-700 border border-success-200/60',
    intermediate: 'bg-warning-50 text-warning-700 border border-warning-200/60',
    advanced: 'bg-error-50 text-error-700 border border-error-200/60',
};

export default function TopicManager() {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [selectedDomainId, setSelectedDomainId] = useState('');
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        api.get('/domains').then(res => {
            setDomains(res.data);
            if (res.data.length > 0) setSelectedDomainId(res.data[0].id);
        });
    }, []);

    useEffect(() => {
        if (!selectedDomainId) return;
        setLoading(true);
        api.get(`/admin/domains/${selectedDomainId}/topics`)
            .then(res => setTopics(res.data))
            .catch(err => console.error('Failed to fetch topics', err))
            .finally(() => setLoading(false));
    }, [selectedDomainId]);

    const toggleAvailability = async (topic: Topic) => {
        setSaving(topic.id);
        try {
            const updated = await api.patch(`/admin/topics/${topic.id}/vit-availability`, {
                is_vit_available: !topic.is_vit_available,
            });
            setTopics(topics.map(t => t.id === topic.id ? updated.data : t));
        } catch (err) {
            console.error('Failed to update topic', err);
        } finally {
            setSaving(null);
        }
    };

    const vitTopics = topics.filter(t => t.source !== 'ai');
    const aiTopics = topics.filter(t => t.source === 'ai');

    return (
        <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-ink-900 tracking-tight">Manage Course Availability</h1>
                    <p className="mt-3 text-lg text-ink-500 max-w-2xl">
                        Toggle whether a VIT curriculum subject is <strong>currently offered</strong> this semester. Students can vote to request subjects that are not currently available.
                    </p>
                </div>
            </div>

            {/* Domain Selector */}
            <div className="relative w-72 bg-white/95 backdrop-blur p-1 rounded-xl shadow-sm border border-ink-200/60">
                <select
                    className="block w-full appearance-none bg-transparent border-none py-2.5 pl-4 pr-10 text-sm font-semibold text-ink-700 focus:outline-none focus:ring-0 cursor-pointer"
                    value={selectedDomainId}
                    onChange={e => setSelectedDomainId(e.target.value)}
                >
                    {domains.map(d => (
                        <option key={d.id} value={d.id} className="font-medium">{d.name}</option>
                    ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-3 h-5 w-5 text-accent-500" />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600" />
                </div>
            ) : (
                <div className="space-y-8">
                    {/* VIT / curriculum topics */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-2xl font-bold text-ink-900">VIT Curriculum Subjects</h2>
                            <span className="px-2.5 py-1 rounded-lg bg-accent-50 border border-accent-100 text-accent-700 text-xs font-bold uppercase tracking-widest">
                                {vitTopics.length}
                            </span>
                        </div>
                        <div className="bg-white/95 backdrop-blur-sm shadow-sm rounded-3xl border border-ink-200/60 overflow-hidden">
                            <table className="min-w-full divide-y divide-ink-100">
                                <thead className="bg-ink-100/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-ink-500 uppercase tracking-widest">Subject</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-ink-500 uppercase tracking-widest">VIT Course Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-ink-500 uppercase tracking-widest">Difficulty</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-ink-500 uppercase tracking-widest">Currently Offered</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ink-100">
                                    {vitTopics.length === 0 ? (
                                        <tr><td colSpan={4} className="px-6 py-8 text-sm text-ink-500 text-center italic">No VIT subjects found for this domain.</td></tr>
                                    ) : vitTopics.map(topic => (
                                        <tr key={topic.id} className="hover:bg-ink-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-ink-900">{topic.title}</div>
                                                <div className="text-sm text-ink-500 mt-1 max-w-sm truncate">{topic.description}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-ink-600">{topic.vit_subject_name || '—'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${DIFFICULTY_COLORS[topic.difficulty] || 'bg-ink-100 text-ink-700 border-ink-200'}`}>
                                                    {topic.difficulty}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    disabled={saving === topic.id}
                                                    onClick={() => toggleAvailability(topic)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 border ${topic.is_vit_available
                                                        ? 'bg-success-50 text-success-700 border-success-200/60 hover:bg-success-100'
                                                        : 'bg-ink-50 text-ink-600 border-ink-200 shadow-sm hover:bg-ink-100'
                                                        } ${saving === topic.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                >
                                                    {topic.is_vit_available
                                                        ? <><CheckCircle className="w-4 h-4" /> Yes – Offered</>
                                                        : <><XCircle className="w-4 h-4" /> No – Not Offered</>}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* AI generated topics */}
                    {aiTopics.length > 0 && (
                        <div>
                            <div className="flex items-center gap-3 mb-4 mt-8">
                                <h2 className="text-2xl font-bold text-ink-900">AI Suggested Topics</h2>
                                <span className="px-2.5 py-1 rounded-lg bg-warning-50 border border-warning-100 text-warning-700 text-xs font-bold uppercase tracking-widest">
                                    {aiTopics.length}
                                </span>
                            </div>
                            <div className="bg-white/95 backdrop-blur-sm shadow-sm rounded-3xl border border-ink-200/60 overflow-hidden">
                                <table className="min-w-full divide-y divide-ink-100">
                                    <thead className="bg-ink-100/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-ink-500 uppercase tracking-widest">Topic</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-ink-500 uppercase tracking-widest">Difficulty</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-ink-500 uppercase tracking-widest">Mark as VIT Course</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-ink-100">
                                        {aiTopics.map(topic => (
                                            <tr key={topic.id} className="hover:bg-ink-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-ink-900">{topic.title}</div>
                                                    <div className="text-sm text-ink-500 mt-1 max-w-sm truncate">{topic.description}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${DIFFICULTY_COLORS[topic.difficulty] || 'bg-ink-100 text-ink-700 border-ink-200'}`}>
                                                        {topic.difficulty}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        disabled={saving === topic.id}
                                                        onClick={() => toggleAvailability(topic)}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 border ${topic.is_vit_available
                                                            ? 'bg-success-50 text-success-700 border-success-200/60 hover:bg-success-100'
                                                            : 'bg-ink-50 text-ink-600 border-ink-200 shadow-sm hover:bg-ink-100'
                                                            } ${saving === topic.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                    >
                                                        {topic.is_vit_available
                                                            ? <><CheckCircle className="w-4 h-4" /> Marked as VIT</>
                                                            : <><XCircle className="w-4 h-4" /> Not in VIT</>}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
