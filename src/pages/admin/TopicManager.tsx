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
    beginner: 'bg-blue-100 text-blue-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
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
        <div className="py-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Manage Course Availability</h1>
            </div>
            <p className="text-sm text-gray-500">
                Toggle whether a VIT curriculum subject is <strong>currently offered</strong> this semester. Students can vote to request subjects that are not currently available.
            </p>

            {/* Domain Selector */}
            <div className="relative w-64">
                <select
                    className="block w-full appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={selectedDomainId}
                    onChange={e => setSelectedDomainId(e.target.value)}
                >
                    {domains.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                </div>
            ) : (
                <div className="space-y-8">
                    {/* VIT / curriculum topics */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">VIT Curriculum Subjects ({vitTopics.length})</h2>
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VIT Course Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currently Offered</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {vitTopics.length === 0 ? (
                                        <tr><td colSpan={4} className="px-6 py-4 text-sm text-gray-500 text-center">No VIT subjects found for this domain.</td></tr>
                                    ) : vitTopics.map(topic => (
                                        <tr key={topic.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{topic.title}</div>
                                                <div className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{topic.description}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{topic.vit_subject_name || '—'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[topic.difficulty] || 'bg-gray-100 text-gray-700'}`}>
                                                    {topic.difficulty}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    disabled={saving === topic.id}
                                                    onClick={() => toggleAvailability(topic)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${topic.is_vit_available
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        } ${saving === topic.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                >
                                                    {topic.is_vit_available
                                                        ? <><CheckCircle className="w-3.5 h-3.5" /> Yes – Offered</>
                                                        : <><XCircle className="w-3.5 h-3.5" /> No – Not Offered</>}
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
                            <h2 className="text-lg font-semibold text-gray-800 mb-3">AI Suggested Topics ({aiTopics.length})</h2>
                            <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mark as VIT Course</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {aiTopics.map(topic => (
                                            <tr key={topic.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{topic.title}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{topic.description}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[topic.difficulty] || 'bg-gray-100 text-gray-700'}`}>
                                                        {topic.difficulty}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        disabled={saving === topic.id}
                                                        onClick={() => toggleAvailability(topic)}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${topic.is_vit_available
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                            } ${saving === topic.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                    >
                                                        {topic.is_vit_available
                                                            ? <><CheckCircle className="w-3.5 h-3.5" /> Marked as VIT</>
                                                            : <><XCircle className="w-3.5 h-3.5" /> Not in VIT</>}
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
