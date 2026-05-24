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

-- Uppdaterad companies tabell med system_prompt
alter table companies 
add column system_prompt text;

-- Exempeldata
insert into companies (name, system_prompt) values 
('Nacka Tak & Plåt', 
 'Du är assistent åt Nacka Tak & Plåt. Var alltid kort, professionell och vänlig. Fokusera på takarbeten.');

insert into companies (name, system_prompt) values 
('Södermalm Fönster', 
 'Du är assistent åt Södermalm Fönster. Betona kvalitet och energieffektivitet.');

 -- Lägg till stöd för bilder
alter table messages 
add column media_url text;

-- Skapa en separat tabell för media om man vill vara mer flexibel
create table lead_media (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references leads(id),
  media_url text not null,
  media_type text,
  created_at timestamp with time zone default now()
);

-- Lägg till owner_id i companies-tabellen (krävs för RLS)
alter table companies 
add column owner_id uuid references auth.users(id);

-- Lägg till services-kolumn för företag
ALTER TABLE companies 
ADD COLUMN services text[] DEFAULT '{}';

-- API Keys per företag
create table api_keys (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  key text unique not null,
  name text,
  created_at timestamp with time zone default now(),
  last_used_at timestamp with time zone
);

-- Index för snabb lookup
create index idx_api_keys_key on api_keys(key);

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
