-- supabase/setup_chats_rls.sql
-- Purpose: Setup Row Level Security (RLS) policies for the `chats` table,
-- assuming `user_id` is a TEXT column storing an external user identifier (e.g., shapes_user_id).

-- IMPORTANT SECURITY CONSIDERATIONS:
-- The RLS policies defined in this script are simplified and use `USING (true)` or `WITH CHECK (true)`.
-- This means the database itself does not restrict row access based on a direct comparison
-- with an authenticated user's ID (like `auth.uid()`). Instead, it relies on the client-side
-- application to correctly filter and manage data by including `user_id = 'current_shapes_user_id'`
-- in its queries (for SELECT, UPDATE, DELETE) and providing the correct `user_id` during INSERT.
--
-- This approach can be acceptable in scenarios where:
--   1. The application exclusively uses a service role key for database operations from its backend,
--      and this backend enforces user ownership before interacting with the database.
--   2. Or, if using the anon/authenticated key directly from the client, it's understood that
--      these policies alone do not prevent a user from accessing/modifying another user's data
--      if they can guess another user's `user_id` and manipulate client-side requests,
--      UNLESS additional measures like strong, unguessable `user_id`s are used and
--      client-side code is strictly controlled.
--
-- For robust multi-tenant security where clients use Supabase's anon/authenticated keys,
-- it's highly recommended to:
--   a) Use RLS policies that can verify the user's identity against the `user_id` in the row.
--      This might involve storing the `shapes_user_id` in a custom JWT claim when using Supabase Auth
--      with custom tokens, and then accessing it in RLS policies via `auth.jwt()->>'custom_claim_name'`.
--   b) Or, proxy all database operations through Supabase Edge Functions (or your own backend)
--      where user authentication and authorization can be explicitly checked before performing
--      database operations using a service role key.

-- 1. Enable Row Level Security (RLS) on the `chats` table
-- This ensures that policies are enforced. It's good practice to include this,
-- though it might already be enabled if policies existed previously.
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats FORCE ROW LEVEL SECURITY; -- Ensures RLS is applied even for table owners unless bypassed

-- 2. Create RLS Policies

-- Policy 1: "Users can select their own chats."
-- This policy allows SELECT operations on all rows.
-- IMPORTANT: Client-side queries MUST use `.eq('user_id', current_shapes_user_id)` for filtering.
-- Without client-enforced filtering, this policy allows any authenticated user to read all chats.
CREATE POLICY "Users can select their own chats."
ON public.chats FOR SELECT
-- TO authenticated -- Specify a role if needed, otherwise defaults to current_role
USING (true);
COMMENT ON POLICY "Users can select their own chats." ON public.chats IS 'Allows SELECT on all rows. Client MUST filter by user_id. SECURITY RISK if client does not filter properly.';

-- Policy 2: "Users can insert new chats for themselves."
-- This policy allows INSERT operations.
-- IMPORTANT: Relies on the client application to provide the correct `user_id` (the current user's shapes_user_id)
-- in the row being inserted. A malicious client could potentially insert chats for other user_ids.
CREATE POLICY "Users can insert new chats for themselves."
ON public.chats FOR INSERT
-- TO authenticated
WITH CHECK (true);
COMMENT ON POLICY "Users can insert new chats for themselves." ON public.chats IS 'Allows INSERT of any row. Client MUST set user_id correctly. SECURITY RISK if client can be manipulated.';

-- Policy 3: "Users can update their own chats."
-- This policy allows UPDATE operations on all rows.
-- IMPORTANT: Client-side queries MUST use `.eq('user_id', current_shapes_user_id)` in the .update() call
-- to ensure users only update their own chats.
CREATE POLICY "Users can update their own chats."
ON public.chats FOR UPDATE
-- TO authenticated
USING (true) -- The USING clause for UPDATE applies to which rows can be targeted by the update.
WITH CHECK (true); -- The WITH CHECK clause applies to the content of the row after update (often same as USING for simple cases).
COMMENT ON POLICY "Users can update their own chats." ON public.chats IS 'Allows UPDATE of any row if matched by client-side query. Client MUST filter by user_id. SECURITY RISK if client does not filter properly.';

-- Policy 4: "Users can delete their own chats."
-- This policy allows DELETE operations on all rows.
-- IMPORTANT: Client-side queries MUST use `.eq('user_id', current_shapes_user_id)` in the .delete() call
-- to ensure users only delete their own chats.
CREATE POLICY "Users can delete their own chats."
ON public.chats FOR DELETE
-- TO authenticated
USING (true);
COMMENT ON POLICY "Users can delete their own chats." ON public.chats IS 'Allows DELETE of any row if matched by client-side query. Client MUST filter by user_id. SECURITY RISK if client does not filter properly.';

-- End of script.
-- Remember to review the security implications mentioned above.
-- For enhanced security, consider using Supabase Edge Functions as an intermediary
-- or implementing RLS policies that can verify the TEXT user_id against a custom JWT claim.
```
