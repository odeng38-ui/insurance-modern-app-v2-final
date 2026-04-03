ALTER TABLE insurance_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS \"Enable read access for all users\" ON insurance_cards;
CREATE POLICY \"Enable read access for all users\" ON insurance_cards FOR SELECT USING (true);
ALTER TABLE disease_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS \"Enable select for all users\" ON disease_codes;
CREATE POLICY \"Enable select for all users\" ON disease_codes FOR SELECT USING (true);
