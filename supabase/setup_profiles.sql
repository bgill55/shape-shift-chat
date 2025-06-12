-- supabase/setup_profiles.sql

-- Ensure the `public` schema exists (though it typically does in PostgreSQL)
CREATE SCHEMA IF NOT EXISTS public;

-- 1. Create the `profiles` table
-- This table will store user profile data, extending the `auth.users` table.
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT now(),
  display_name TEXT, -- User's preferred public display name. Can be NULL.
  avatar_url TEXT    -- URL to the user's avatar image. Can be NULL. For future use.
);

-- Add comments to the table and columns for clarity
COMMENT ON TABLE public.profiles IS 'Stores public profile information for each user, extending auth.users.';
COMMENT ON COLUMN public.profiles.id IS 'References the internal Supabase auth.users ID. Primary key.';
COMMENT ON COLUMN public.profiles.updated_at IS 'Timestamp of the last profile update.';
COMMENT ON COLUMN public.profiles.display_name IS 'User''s preferred public display name. Can be NULL initially.';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to the user''s avatar image. Intended for future use.';

-- Add a check constraint for display_name length, allowing NULL
ALTER TABLE public.profiles
ADD CONSTRAINT display_name_length_check CHECK (char_length(display_name) >= 3 OR display_name IS NULL);

-- 2. Enable Row Level Security (RLS) on the `profiles` table
-- This is crucial for ensuring data privacy and that users can only access their own data as per policies.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Policy: Users can view their own profile.
-- Allows a user to SELECT (read) their own profile data.
CREATE POLICY "Users can view their own profile."
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can insert their own profile.
-- Allows a user to create a profile entry for themselves.
-- The WITH CHECK clause ensures that a user cannot insert a profile for someone else.
CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile.
-- Allows a user to update their own profile data.
-- The WITH CHECK clause ensures a user cannot modify another user's profile.
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Note: A DELETE policy is not explicitly added here.
-- Profile deletion is handled by the `ON DELETE CASCADE` constraint on the `id` column,
-- meaning if a user is deleted from `auth.users`, their corresponding profile in `public.profiles`
-- will be automatically deleted. Allowing direct deletion from `profiles` might be undesirable.

-- 4. Database function `public.handle_new_user()`
-- This function is triggered when a new user signs up (a new entry is made in `auth.users`).
-- It automatically creates a corresponding profile entry in `public.profiles`.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Important: Executes with the permissions of the user who defined the function (usually an admin/postgres role)
SET search_path = public, extensions; -- Ensure correct schema context
AS $$
BEGIN
  -- Insert a new profile row for the new user.
  -- `id` is taken from the new user record in `auth.users`.
  -- `display_name` and `avatar_url` are left as NULL initially.
  -- They can be populated from NEW.raw_user_meta_data if available during sign-up, e.g.:
  -- NEW.raw_user_meta_data->>'display_name'
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger function to automatically create a profile for a new user upon registration in auth.users.';

-- 5. Trigger `on_auth_user_created`
-- This trigger fires after a new user is inserted into the `auth.users` table,
-- executing the `handle_new_user` function to create their profile.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Automatically creates a profile entry for new users after they are added to auth.users.';

-- End of script.
-- Consider running these commands in the Supabase SQL Editor.
-- Ensure this user (definer of handle_new_user) has necessary permissions on public.profiles.
-- Supabase's default postgres user usually has these.
```
