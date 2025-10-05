-- RLS (Row-Level Security) for the 'chats' table.
-- This policy ensures that users can only interact with their own chat records.

-- 1. Make sure RLS is enabled on the 'chats' table
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts (optional, but recommended for a clean setup)
DROP POLICY IF EXISTS "Allow individual read access" ON public.chats;
DROP POLICY IF EXISTS "Allow individual insert access" ON public.chats;
DROP POLICY IF EXISTS "Allow individual update access" ON public.chats;
DROP POLICY IF EXISTS "Allow individual delete access" ON public.chats;

-- 3. Create policies for each operation (SELECT, INSERT, UPDATE, DELETE)
--    These policies use `auth.uid()` to securely get the current authenticated user's ID.

-- Policy for SELECT operations
-- Allows a user to read their own chats.
CREATE POLICY "Allow individual read access"
ON public.chats
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for INSERT operations
-- Allows a user to create new chats for themselves.
CREATE POLICY "Allow individual insert access"
ON public.chats
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE operations
-- Allows a user to update their own chats.
CREATE POLICY "Allow individual update access"
ON public.chats
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for DELETE operations
-- Allows a user to delete their own chats.
CREATE POLICY "Allow individual delete access"
ON public.chats
FOR DELETE
USING (auth.uid() = user_id);