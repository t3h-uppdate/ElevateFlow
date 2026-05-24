'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit2, Key, Trash2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import EditCompanyForm from './EditCompanyForm';

interface Company {
  id: string;
  name: string;
  system_prompt: string | null;
  phone_number: string | null;
  email: string | null;
  services?: string[];
  created_at: string;
}

export default function CompanyList({ companies }: { companies: Company[] }) {
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Är du säker på att du vill ta bort detta företag?')) return;
    await fetch(`/api/admin/companies/${id}`, { method: 'DELETE' });
    toast.success('Företaget har tagits bort');
    window.location.reload();
  };

  const handleGenerateApiKey = async (companyId: string) => {
    const res = await fetch(`/api/admin/companies/${companyId}/api-key`, {
      method: 'POST',
    });
    const data = await res.json();

    if (data.apiKey) {
      toast.success('API-nyckel genererad!', {
        description: 'Nyckeln har kopierats till urklipp.',
        action: {
          label: 'Kopiera',
          onClick: () => navigator.clipboard.writeText(data.apiKey),
        },
      });
      navigator.clipboard.writeText(data.apiKey);
    }
  };

  return (
    <>
      <Toaster position="top-center" richColors />

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-lg">Alla företag</h2>
          <span className="text-sm text-gray-500">{companies.length} st</span>
        </div>

        {companies.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Inga företag tillagda ännu.</div>
        ) : (
          <div className="divide-y">
            {companies.map((company) => (
              <div key={company.id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="font-semibold text-lg">{company.name}</div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {company.phone_number || '—'} • {company.email || '—'}
                    </div>
                    {company.services && company.services.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {company.services.slice(0, 4).map((service, index) => (
                          <span key={index} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                            {service}
                          </span>
                        ))}
                        {company.services.length > 4 && (
                          <span className="text-xs text-gray-500">+{company.services.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingCompany(company);
                        setShowDialog(true);
                      }}
                    >
                      <Edit2 className="mr-2 h-4 w-4" /> Redigera
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleGenerateApiKey(company.id)}
                    >
                      <Key className="mr-2 h-4 w-4" /> API-nyckel
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(company.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Ta bort
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Redigera företag</DialogTitle>
          </DialogHeader>
          {editingCompany && (
            <EditCompanyForm 
              company={editingCompany} 
              onClose={() => {
                setShowDialog(false);
                setEditingCompany(null);
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
