-- Enable the UUID extension
create extension if not exists "uuid-ossp";

-- Companies (Musses kunder)
create table companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone_number text,
  email text,
  created_at timestamp with time zone default now()
);

-- Leads
create table leads (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id),
  name text,
  phone text not null,
  email text,
  service text,
  project_description text,
  status text default 'new', -- new, qualified, booked, lost
  created_at timestamp with time zone default now()
);

-- Messages (konversationshistorik)
create table messages (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references leads(id),
  role text not null, -- 'user' eller 'assistant'
  content text not null,
  created_at timestamp with time zone default now()
);

-- Index för snabb sökning
create index idx_leads_phone on leads(phone);
create index idx_messages_lead_id on messages(lead_id);

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