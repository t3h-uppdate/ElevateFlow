import Layout from '@/components/Layout';
import LeadForm from '@/components/LeadForm';

export default function TestLeadPage() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Testa ElevateFlow AI</h1>
          <p className="text-gray-600 mt-2">
            Fyll i formuläret för att simulera ett inkommande lead. AI:n skickar då SMS + e-post automatiskt.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border shadow-sm">
          <LeadForm />
        </div>
      </div>
    </Layout>
  );
}
