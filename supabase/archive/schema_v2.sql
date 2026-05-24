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