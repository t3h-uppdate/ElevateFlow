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