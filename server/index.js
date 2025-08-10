// server/index.js
require('dotenv').config({ path: './server/.env' });
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Validate environment (important) ---
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('Missing SUPABASE_URL in env (set SUPABASE_URL).');
  process.exit(1);
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in env. Add your service role key to server .env.');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client (server-side using service role key - bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
console.log('Supabase client initialized with SERVICE ROLE key (server-only).');

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'email, password and fullName are required' });
    }

    // Check if user already exists (maybeSingle avoids throwing if not found)
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    if (existingUserError) {
      console.error('Error checking existing user:', existingUserError);
      // continue — service role should allow the insert; but inform the client
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user (service role bypasses RLS; server is responsible for validation & hashing)
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        email,
        password_hash: passwordHash,
        full_name: fullName
      }])
      .select('id, email, full_name')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(400).json({ error: error.message || 'Failed to create user' });
    }

    // Generate JWT token (this is your app token, not Supabase auth token)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user.id, email: user.email, fullName: user.full_name }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, full_name')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('Supabase select user error:', error);
      return res.status(500).json({ error: 'Server error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, fullName: user.full_name }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Exam routes
app.get('/api/exam/questions', authenticateToken, async (req, res) => {
  try {
    const { data: questions, error } = await supabase
      .from('questions')
      .select('id, question_text, options')
      .order('created_at')
      .limit(10);

    if (error) {
      console.error('Supabase questions fetch error:', error);
      return res.status(400).json({ error: error.message });
    }

    // Shuffle questions for randomization
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);

    res.json({ questions: shuffledQuestions });
  } catch (error) {
    console.error('Questions fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/exam/submit', authenticateToken, async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const userId = req.user.userId;

    // Get correct answers
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, correct_answer');

    if (questionsError) {
      console.error('Supabase questions select error:', questionsError);
      return res.status(400).json({ error: questionsError.message });
    }

    // Calculate score
    let score = 0;
    const totalQuestions = Object.keys(answers || {}).length;

    Object.entries(answers || {}).forEach(([questionId, selectedAnswer]) => {
      const question = questions.find(q => String(q.id) === String(questionId));
      if (question && question.correct_answer === selectedAnswer) {
        score++;
      }
    });

    // Save exam attempt
    const { data: examAttempt, error: saveError } = await supabase
      .from('exam_attempts')
      .insert([{
        user_id: userId,
        score,
        total_questions: totalQuestions,
        time_taken: timeTaken,
        answers: JSON.stringify(answers || {})
      }])
      .select()
      .single();

    if (saveError) {
      console.error('Supabase insert exam_attempts error:', saveError);
      return res.status(400).json({ error: saveError.message });
    }

    res.json({
      score,
      totalQuestions,
      percentage: totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0,
      timeTaken,
      attemptId: examAttempt.id
    });
  } catch (error) {
    console.error('Exam submit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/exam/results/:attemptId', authenticateToken, async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.userId;

    const { data: attempt, error } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('id', attemptId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Supabase fetch attempt error:', error);
      return res.status(500).json({ error: 'Server error' });
    }

    if (!attempt) {
      return res.status(404).json({ error: 'Exam attempt not found' });
    }

    res.json({
      score: attempt.score,
      totalQuestions: attempt.total_questions,
      percentage: Math.round((attempt.score / attempt.total_questions) * 100),
      timeTaken: attempt.time_taken,
      completedAt: attempt.completed_at
    });
  } catch (error) {
    console.error('Results fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
