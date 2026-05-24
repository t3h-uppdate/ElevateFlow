-- Enable the UUID extension
create extension if not exists "uuid-ossp";

create table companies (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id),
  name text not null,
  phone_number text,
  email text,
  system_prompt text,
  services text[] default '{}',
  created_at timestamp with time zone default now()
);

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

create table messages (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references leads(id),
  role text not null,
  content text not null,
  media_url text,
  created_at timestamp with time zone default now()
);

create table lead_media (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references leads(id),
  media_url text not null,
  media_type text,
  created_at timestamp with time zone default now()
);

create table api_keys (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  key text unique not null,
  name text,
  created_at timestamp with time zone default now(),
  last_used_at timestamp with time zone
);

create index idx_leads_phone on leads(phone);
create index idx_messages_lead_id on messages(lead_id);
create index idx_api_keys_key on api_keys(key);

insert into companies (name, system_prompt) values 
('Nacka Tak & Plåt', 'Du är assistent åt Nacka Tak & Plåt. Var alltid kort, professionell och vänlig. Fokusera på takarbeten.'),
('Södermalm Fönster', 'Du är assistent åt Södermalm Fönster. Betona kvalitet och energieffektivitet.');

alter table companies enable row level security;
alter table leads enable row level security;
alter table messages enable row level security;
alter table api_keys enable row level security;
alter table lead_media enable row level security;

create policy "Users can manage their own companies"
on companies
for all
using (auth.uid() = owner_id);

create policy "Users can manage leads for their companies"
on leads
for all
using (
  company_id in (
    select id from companies where owner_id = auth.uid()
  )
);

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

create policy "Users can manage their API keys"
on api_keys
for all
using (
  company_id in (
    select id from companies where owner_id = auth.uid()
  )
);

create policy "Users can manage media for their leads"
on lead_media
for all
using (
  lead_id in (
    select id from leads where company_id in (
      select id from companies where owner_id = auth.uid()
    )
  )
);