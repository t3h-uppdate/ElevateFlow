'use client';

import { useState } from 'react';
import { toast, Toaster } from 'sonner';

export default function LeadForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const payload = {
      companyName: formData.get('companyName'),
      service: formData.get('service'),
      customerName: formData.get('customerName'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      projectDescription: formData.get('projectDescription'),
    };

    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setSuccess(true);
      toast.success('Lead skickad!', {
        description: 'AI-agenten har börjat kontakta kunden.',
      });
    } else {
      toast.error('Något gick fel');
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-green-600 text-xl font-semibold">Lead skickad!</div>
        <p className="text-gray-600 mt-2">AI-agenten har börjat kontakta kunden.</p>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Företagsnamn</label>
            <input name="companyName" required className="w-full border p-3 rounded-2xl" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Tjänst</label>
            <input name="service" required className="w-full border p-3 rounded-2xl" placeholder="Takläggning" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Kundens namn</label>
            <input name="customerName" required className="w-full border p-3 rounded-2xl" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Telefonnummer</label>
            <input name="phone" type="tel" required className="w-full border p-3 rounded-2xl" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">E-post (valfritt)</label>
          <input name="email" type="email" className="w-full border p-3 rounded-2xl" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Projektbeskrivning</label>
          <textarea 
            name="projectDescription" 
            rows={3} 
            className="w-full border p-3 rounded-2xl" 
            placeholder="Kort beskrivning av jobbet..."
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-black hover:bg-gray-800 transition-colors text-white py-3.5 rounded-2xl font-medium disabled:opacity-60 mt-2"
        >
          {loading ? 'Skickar lead...' : 'Skicka lead till AI'}
        </button>
      </form>
    </>
  );
}
