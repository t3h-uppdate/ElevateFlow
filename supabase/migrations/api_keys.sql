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