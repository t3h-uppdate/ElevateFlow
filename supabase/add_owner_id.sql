-- Lägg till owner_id i companies-tabellen (krävs för RLS)
alter table companies 
add column owner_id uuid references auth.users(id);