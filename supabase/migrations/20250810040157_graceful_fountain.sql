-- ============================================================
-- Exam Platform: Full schema + RLS policies (safe-to-run)
-- ============================================================
-- NOTE (security):
-- 1) This script allows public INSERT on `users` so registration works.
--    Backend must still hash passwords & validate inputs.
-- 2) Production recommendation: do registration/login via your backend
--    using the Supabase service_role key (server-side), or tighten policies.
-- ============================================================

-- 1) Ensure extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Create tables if they don't exist
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  options jsonb NOT NULL,
  correct_answer integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 0,
  time_taken integer NOT NULL DEFAULT 0,
  answers jsonb NOT NULL DEFAULT '{}',
  completed_at timestamptz DEFAULT now()
);

-- 3) Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;

-- 4) Drop old policies if present (avoids "policy already exists" errors)
DROP POLICY IF EXISTS "allow_insert_for_registration" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can delete own data" ON users;
DROP POLICY IF EXISTS "Questions are readable by authenticated users" ON questions;
DROP POLICY IF EXISTS "Users can read own exam attempts" ON exam_attempts;
DROP POLICY IF EXISTS "Users can insert own exam attempts" ON exam_attempts;
DROP POLICY IF EXISTS "Users can update own exam attempts" ON exam_attempts;
DROP POLICY IF EXISTS "Users can delete own exam attempts" ON exam_attempts;

-- 5) Create policies

-- USERS: allow public insert for registration (backend must validate & hash)
CREATE POLICY "allow_insert_for_registration"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (
    email IS NOT NULL
    AND password_hash IS NOT NULL
    AND full_name IS NOT NULL
  );

-- USERS: authenticated users can SELECT/UPDATE/DELETE only their own row
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own data"
  ON users
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- QUESTIONS: readable by authenticated users
CREATE POLICY "Questions are readable by authenticated users"
  ON questions
  FOR SELECT
  TO authenticated
  USING (true);

-- EXAM_ATTEMPTS: restrict to owner
CREATE POLICY "Users can read own exam attempts"
  ON exam_attempts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own exam attempts"
  ON exam_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own exam attempts"
  ON exam_attempts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own exam attempts"
  ON exam_attempts
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 6) Seed sample questions only if table is empty
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM questions) = 0 THEN
    INSERT INTO questions (question_text, options, correct_answer) VALUES
      ('What is the capital of France?', '["Paris", "London", "Berlin", "Madrid"]', 0),
      ('Which programming language is known as the "language of the web"?', '["Python", "Java", "JavaScript", "C++"]', 2),
      ('What does CPU stand for?', '["Central Processing Unit", "Computer Personal Unit", "Central Personal Unit", "Computer Processing Unit"]', 0),
      ('Which company developed React.js?', '["Google", "Microsoft", "Facebook", "Apple"]', 2),
      ('What is the time complexity of binary search?', '["O(n)", "O(log n)", "O(n²)", "O(1)"]', 1),
      ('Which HTTP method is used to retrieve data?', '["POST", "PUT", "DELETE", "GET"]', 3),
      ('What does SQL stand for?', '["Structured Query Language", "Sequential Query Language", "Simple Query Language", "Standard Query Language"]', 0),
      ('Which of the following is NOT a JavaScript data type?', '["String", "Boolean", "Float", "Number"]', 2),
      ('What is the default port for HTTP?', '["443", "8080", "80", "3000"]', 2),
      ('Which database is known as a NoSQL database?', '["MySQL", "PostgreSQL", "MongoDB", "SQLite"]', 2);
  END IF;
END
$$;

-- ============================================================
-- Done. After running:
--  - Refresh backend and test registration.
--  - Ensure your backend stores bcrypt-hashed password into password_hash (server-side).
--  - For login/reading users, prefer server-side queries using service_role key
--    (so you avoid RLS limits on SELECT if you are not using Supabase Auth).
-- ============================================================
