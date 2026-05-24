import Layout from '@/components/Layout';
import AddCompanyForm from './AddCompanyForm';
import CompanyList from './CompanyList';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function CompaniesAdmin() {
  const supabase = createServerComponentClient({ cookies });
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Företagshantering</h1>
            <p className="text-gray-600 mt-1">
              Hantera alla företag som använder ElevateFlow AI
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-sm text-gray-500">
            {companies?.length || 0} företag
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Add Company Form */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border p-6 shadow-sm">
              <h2 className="font-semibold text-lg mb-4">Lägg till nytt företag</h2>
              <AddCompanyForm />
            </div>
          </div>

          {/* Companies List */}
          <div className="lg:col-span-7">
            <CompanyList companies={companies || []} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
