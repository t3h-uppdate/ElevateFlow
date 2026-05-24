-- Lägg till services-kolumn för företag
ALTER TABLE companies 
ADD COLUMN services text[] DEFAULT '{}';