-- Row Level Security för ElevateFlow AI

-- Enable RLS
alter table companies enable row level security;
alter table leads enable row level security;
alter table messages enable row level security;
alter table api_keys enable row level security;

-- Policy: Företag kan bara se sina egna data
create policy "Companies can view own data"
on companies for select
using (auth.uid()::text = id::text); -- Anpassa efter din auth setup

create policy "Leads can view own company data"
on leads for select
using (company_id in (select id from companies));

create policy "Messages can view own company data"
on messages for select
using (lead_id in (select id from leads));

create policy "API keys can view own company data"
on api_keys for select
using (company_id in (select id from companies));