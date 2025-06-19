-- supabase/modify_chats_table.sql
-- Purpose: Modify the 'chats' table to use TEXT for user_id, suitable for Shapes-only user IDs
-- which may not be UUIDs or directly linked to auth.users.

-- Important: Before running this script, ensure you have a backup of your `chats` table
-- if it contains critical data. Also, verify the names of existing policies and constraints
-- if they differ from the common conventions used below.

-- 1. Drop Existing RLS Policies on public.chats
-- It's necessary to drop RLS policies that might depend on the old user_id type
-- or specifically reference `auth.uid()`. These will be recreated later with updated logic.
-- Replace policy names with your actual policy names if different.
-- If you are unsure of policy names, you can find them in the Supabase dashboard
-- or query `pg_policies` table.
COMMENT ON SCHEMA public IS 'Standard public schema.'; -- Ensure schema comment exists for Supabase if needed

DROP POLICY IF EXISTS "Users can view their own chats." ON public.chats;
DROP POLICY IF EXISTS "Users can insert their own chats." ON public.chats;
DROP POLICY IF EXISTS "Users can update their own chats." ON public.chats;
DROP POLICY IF EXISTS "Users can delete their own chats." ON public.chats;
-- Add any other specific policies you might have on the chats table:
-- DROP POLICY IF EXISTS "PolicyName" ON public.chats;

-- 2. Drop Foreign Key Constraint on user_id (if it exists and references auth.users)
-- This step is crucial if user_id was previously a UUID referencing auth.users(id).
-- The constraint name 'chats_user_id_fkey' is a common convention.
-- Please verify the actual constraint name in your schema if this command fails.
-- You can find constraint names by inspecting the table in the Supabase dashboard
-- or using psql commands like \d public.chats.
ALTER TABLE public.chats
DROP CONSTRAINT IF EXISTS chats_user_id_fkey;

-- As an alternative, to find the constraint name if unknown:
-- SELECT conname
-- FROM pg_constraint
-- WHERE conrelid = 'public.chats'::regclass
--   AND confrelid = 'auth.users'::regclass
--   AND ARRAY[attnum] <@ ANY(conkey) -- Replace attnum with the column number of user_id if needed, or simplify if user_id is the only FK to auth.users
--   AND contype = 'f';
-- Then use the retrieved name in the DROP CONSTRAINT command.
-- For simplicity, we assume the common name or that it might not exist if user_id was already TEXT.

-- 3. Change user_id Column Type to TEXT
-- This alters the user_id column to store TEXT, which can accommodate various ID formats
-- including those from Shapes or other custom authentication systems.
-- We assume the column 'user_id' already exists. If it does not, you would use ADD COLUMN.
-- If it exists and is already TEXT, this command might result in a notice but should not error.
ALTER TABLE public.chats
ALTER COLUMN user_id TYPE TEXT;

-- If the column `user_id` might not exist, you could use a more complex DO block
-- or handle it in two steps (e.g., ADD COLUMN IF NOT EXISTS first, then ensure type).
-- For this script, we focus on the alteration of an existing column.
-- Example for adding if not exists (run separately if needed, or adapt with DO block):
-- ALTER TABLE public.chats
-- ADD COLUMN IF NOT EXISTS user_id TEXT;

COMMENT ON COLUMN public.chats.user_id IS 'Stores the user identifier, now as TEXT to support various ID formats (e.g., Shapes user IDs).';

-- Further steps (to be done in a subsequent script or manually):
-- 1. Recreate RLS policies for the `chats` table using the TEXT `user_id` and an appropriate way
--    to get the current user's ID (e.g., from a custom session claim or another source if not auth.uid()).
-- 2. If you still need to relate to `auth.users` for some users, this relationship is now implicit
--    or needs to be managed at the application level or via other tables.
-- 3. Update any application code that assumes `user_id` is a UUID or directly linked to `auth.users`.

-- End of script.
```
