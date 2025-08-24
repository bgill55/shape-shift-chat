ALTER TABLE personas DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert their own personas." ON personas;
DROP POLICY IF EXISTS "Users can view their own personas." ON personas;
DROP POLICY IF EXISTS "Users can update their own personas." ON personas;
DROP POLICY IF EXISTS "Users can delete their own personas." ON personas;
