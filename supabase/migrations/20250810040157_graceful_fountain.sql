/*
  # Initial Schema for Exam Platform

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `full_name` (text)
      - `created_at` (timestamp)
    - `questions`
      - `id` (uuid, primary key)
      - `question_text` (text)
      - `options` (jsonb array of options)
      - `correct_answer` (integer, index of correct option)
      - `created_at` (timestamp)
    - `exam_attempts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `score` (integer)
      - `total_questions` (integer)
      - `time_taken` (integer in seconds)
      - `answers` (jsonb)
      - `completed_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table (for custom authentication)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  options jsonb NOT NULL,
  correct_answer integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Exam attempts table
CREATE TABLE IF NOT EXISTS exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 0,
  time_taken integer NOT NULL DEFAULT 0,
  answers jsonb NOT NULL DEFAULT '{}',
  completed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Questions are readable by authenticated users"
  ON questions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read own exam attempts"
  ON exam_attempts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own exam attempts"
  ON exam_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert sample questions
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