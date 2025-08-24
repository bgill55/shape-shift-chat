ALTER TABLE profiles
ADD CONSTRAINT profiles_user_id_fkey
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
