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
    <div className="py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Choose Your Career Domain</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {domains.map((domain) => {
          const Icon = iconMap[domain.icon] || Server;
          return (
            <div
              key={domain.id}
              onClick={() => handleSelect(domain.id)}
              className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow duration-200 border border-gray-200"
            >
              <div className="px-4 py-5 sm:p-6 flex flex-col items-center text-center">
                <div className="p-3 bg-indigo-100 rounded-full mb-4">
                  <Icon className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">{domain.name}</h3>
                <p className="mt-2 text-sm text-gray-500">{domain.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
