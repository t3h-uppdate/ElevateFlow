'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AVAILABLE_SERVICES = [
  "Takläggare", "Målare", "Snickare", "Badrumsrenovering", "Golvläggare",
  "Taktvätt", "Takvård", "Fasadtvätt", "Takmålning", "Byggföretag",
  "Attefallshus", "Dränering", "Pool", "Markarbeten"
];

export default function AddCompanyForm() {
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const router = useRouter();

  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const res = await fetch('/api/admin/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        system_prompt: formData.get('system_prompt'),
        phone_number: formData.get('phone_number'),
        email: formData.get('email'),
        services: selectedServices,
      }),
    });

    if (res.ok) {
      toast.success('Företag tillagt!');
      router.refresh();
      (e.target as HTMLFormElement).reset();
      setSelectedServices([]);
    } else {
      toast.error('Något gick fel');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label>Företagsnamn</Label>
        <Input name="name" required placeholder="Nacka Tak & Plåt" />
      </div>

      <div>
        <Label>Tjänster / Kundtyper</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {AVAILABLE_SERVICES.map((service) => (
            <label key={service} className="flex items-center gap-2 text-sm border rounded-xl px-3 py-2 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={selectedServices.includes(service)}
                onChange={() => toggleService(service)}
              />
              {service}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label>System Prompt (valfritt)</Label>
        <textarea 
          name="system_prompt" 
          rows={3} 
          className="w-full border p-3 rounded-2xl text-sm"
          placeholder="Du är assistent åt [Företag]..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Telefonnummer</Label>
          <Input name="phone_number" placeholder="+4670..." />
        </div>
        <div>
          <Label>E-post</Label>
          <Input name="email" type="email" />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full mt-2">
        {loading ? 'Sparar...' : 'Lägg till företag'}
      </Button>
    </form>
  );
}
