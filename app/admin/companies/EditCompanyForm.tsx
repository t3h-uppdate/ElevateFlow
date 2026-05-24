'use client';

import { useState } from 'react';

interface Company {
  id: string;
  name: string;
  system_prompt: string | null;
  phone_number: string | null;
  email: string | null;
  services?: string[];
}

const AVAILABLE_SERVICES = [
  "Takläggare", "Målare", "Snickare", "Badrumsrenovering", "Golvläggare",
  "Taktvätt", "Takvård", "Fasadtvätt", "Takmålning", "Byggföretag",
  "Attefallshus", "Dränering", "Pool", "Markarbeten"
];

export default function EditCompanyForm({ 
  company, 
  onClose 
}: { 
  company: Company; 
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: company.name,
    system_prompt: company.system_prompt || '',
    phone_number: company.phone_number || '',
    email: company.email || '',
    services: company.services || [],
  });

  const toggleService = (service: string) => {
    if (formData.services.includes(service)) {
      setFormData({
        ...formData,
        services: formData.services.filter(s => s !== service)
      });
    } else {
      setFormData({
        ...formData,
        services: [...formData.services, service]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/admin/companies/${company.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      window.location.reload();
    } else {
      alert('Något gick fel');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1">Företagsnamn</label>
        <input 
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full border p-3 rounded-2xl" 
          required 
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tjänster</label>
        <div className="grid grid-cols-2 gap-2">
          {AVAILABLE_SERVICES.map((service) => (
            <label key={service} className="flex items-center gap-2 text-sm border rounded-xl px-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.services.includes(service)}
                onChange={() => toggleService(service)}
              />
              {service}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">System Prompt</label>
        <textarea 
          value={formData.system_prompt}
          onChange={(e) => setFormData({...formData, system_prompt: e.target.value})}
          rows={4}
          className="w-full border p-3 rounded-2xl text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Telefonnummer</label>
          <input 
            value={formData.phone_number}
            onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
            className="w-full border p-3 rounded-2xl" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">E-post</label>
          <input 
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full border p-3 rounded-2xl" 
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button 
          type="button" 
          onClick={onClose}
          className="flex-1 border py-2.5 rounded-2xl"
        >
          Avbryt
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="flex-1 bg-black text-white py-2.5 rounded-2xl disabled:opacity-50"
        >
          {loading ? 'Sparar...' : 'Spara ändringar'}
        </button>
      </div>
    </form>
  );
}
