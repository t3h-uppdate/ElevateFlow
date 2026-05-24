-- Bättre Row Level Security för ElevateFlow AI
-- Kräver att du använder Supabase Auth (auth.users)

alter table companies enable row level security;
alter table leads enable row level security;
alter table messages enable row level security;
alter table api_keys enable row level security;

-- Policy för companies
create policy "Users can manage their own companies"
on companies
for all
using (auth.uid() = owner_id); -- Du behöver lägga till owner_id i companies-tabellen

-- Policy för leads
create policy "Users can manage leads for their companies"
on leads
for all
using (
  company_id in (
    select id from companies where owner_id = auth.uid()
  )
);

-- Policy för messages
create policy "Users can manage messages for their leads"
on messages
for all
using (
  lead_id in (
    select id from leads where company_id in (
      select id from companies where owner_id = auth.uid()
    )
  )
);

-- Policy för api_keys
create policy "Users can manage their API keys"
on api_keys
for all
using (
  company_id in (
    select id from companies where owner_id = auth.uid()
  )
);