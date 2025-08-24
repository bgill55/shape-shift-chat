ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

ALTER TABLE profiles
ADD PRIMARY KEY (id);
