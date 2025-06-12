-- supabase/setup_profiles.sql

-- 1. Create the `profiles` table
-- This table will store user profile data, extending the `auth.users` table.
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMPTZ DEFAULT now(),
  display_name TEXT, -- Can be used to store the user's preferred name.
  avatar_url TEXT,   -- For future use, to store URL of user's avatar image.

  CONSTRAINT display_name_length CHECK (char_length(display_name) >= 3 OR display_name IS NULL) -- Example constraint
);

COMMENT ON TABLE public.profiles IS 'Stores public profile information for each user.';
COMMENT ON COLUMN public.profiles.id IS 'References the internal Supabase auth user ID.';
COMMENT ON COLUMN public.profiles.display_name IS 'User''s preferred public display name. Can be NULL.';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to the user''s avatar image. Can be NULL.';

-- 2. Enable Row Level Security (RLS) on the `profiles` table
-- This ensures that the policies defined below are enforced.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Policy 1: "Profiles are viewable by users who created them."
-- This policy allows users to select (read) their own profile data.
CREATE POLICY "Profiles are viewable by users who created them."
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Policy 2: "Users can insert their own profile."
-- This policy allows users to insert a new profile entry for themselves.
-- The `WITH CHECK` clause ensures that a user cannot insert a profile for someone else.
CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy 3: "Users can update their own profile."
-- This policy allows users to update their own profile data.
-- The `WITH CHECK` clause (though often the same as USING for UPDATE if not specifying columns)
-- ensures a user cannot change the `id` to someone else's during an update,
-- though this is also protected by it being a primary key.
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- (Optional, for future consideration)
-- Policy 4: "Authenticated users can view other users' display_name and avatar_url."
-- This policy would allow any authenticated user to see basic public info of other users.
-- For now, this is commented out to keep profiles private to their owners.
--
-- CREATE POLICY "Authenticated users can view basic public profile info."
-- ON public.profiles FOR SELECT
-- TO authenticated
-- USING (true); -- Allows selection of all rows, but column-level security would be needed
                 -- or ensure only non-sensitive columns are exposed via views/RPC functions.
                 -- A better approach for this specific scenario might be a view or function
                 -- that only exposes `id`, `display_name`, and `avatar_url`.

-- Note on public access: If you wanted display_name and avatar_url to be truly public (even for non-authenticated users),
-- you would create a policy specifically for that, or more likely, create a security definer function or a view
-- that exposes only these non-sensitive fields.

-- Example of a function to handle profile creation automatically on new user sign-up (trigger-based)
-- This is often preferred over relying on users to insert their own profile record manually.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name'); -- Example: try to get display_name from sign-up metadata
  RETURN NEW;
END;
$$;

-- Create a trigger to call the function when a new user is added to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add a comment explaining the trigger.
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile entry for new users, optionally populating fields from metadata.';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'When a new user signs up, automatically create their profile.';

-- Note: If you add the trigger, ensure the service role or postgres role has permissions if needed,
-- but SECURITY DEFINER functions run with the privileges of the user who defined the function.
-- Supabase handles this well for standard auth triggers.

-- Consider adding an RLS policy for DELETE if users should be able to delete their own profiles.
-- CREATE POLICY "Users can delete their own profile."
-- ON public.profiles FOR DELETE
-- USING (auth.uid() = id);
-- However, since `id` references `auth.users` with `ON DELETE CASCADE`,
-- deleting a user from `auth.users` will automatically delete their profile.
-- Allowing users to delete their profile row directly might leave their `auth.users` entry orphaned
-- if not handled carefully, so `ON DELETE CASCADE` is often the primary mechanism.
```
