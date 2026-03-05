import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Server, Layout, BarChart, Brain, Infinity, Shield, Layers, Smartphone } from 'lucide-react';

const iconMap: Record<string, any> = {
  'server': Server,
  'layout': Layout,
  'bar-chart': BarChart,
  'brain': Brain,
  'infinity': Infinity,
  'shield': Shield,
  'layers': Layers,
  'smartphone': Smartphone
};

export default function DomainSelect() {
  const [domains, setDomains] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await api.get('/domains');
        setDomains(response.data);
      } catch (error) {
        console.error('Failed to fetch domains', error);
      }
    };
    fetchDomains();
  }, []);

  const handleSelect = async (domainId: string) => {
    try {
      await api.post(`/domains/${domainId}/select`);
      navigate(`/student/domains/${domainId}/topics`);
    } catch (error) {
      console.error('Failed to select domain', error);
    }
  };

  return (
    <div className="py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-ink-900 tracking-tight">Choose Your Career Domain</h1>
        <p className="mt-4 text-lg text-ink-500 max-w-2xl mx-auto">Select a path to discover your personalized learning roadmap, spanning both university curriculum and cutting-edge industry skills.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
        {domains.map((domain) => {
          const Icon = iconMap[domain.icon] || Server;
          return (
            <div
              key={domain.id}
              onClick={() => handleSelect(domain.id)}
              className="bg-white/95 backdrop-blur-sm shadow-sm hover:shadow-xl hover:-translate-y-1 rounded-3xl cursor-pointer transition-all duration-300 border border-ink-200/60 overflow-hidden group"
            >
              <div className="px-6 py-8 flex flex-col items-center text-center">
                <div className="p-4 bg-accent-50 text-accent-600 rounded-2xl mb-5 group-hover:scale-110 group-hover:bg-accent-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-ink-900 group-hover:text-accent-600 transition-colors">{domain.name}</h3>
                <p className="mt-3 text-sm text-ink-500 leading-relaxed">{domain.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
