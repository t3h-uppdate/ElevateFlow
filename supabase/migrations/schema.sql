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