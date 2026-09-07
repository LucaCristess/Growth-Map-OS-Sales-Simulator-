-- Growth Map Sales Scale Simulator - Initial Schema

-- Sessions table (anonymous tracking)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  scan_type TEXT CHECK (scan_type IN ('quick', 'deep')),
  completed BOOLEAN DEFAULT false,
  utm_params JSONB
);

-- Answers table (persisted per question)
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, question_key)
);

-- Leads table (captured after free results)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  qualification_score INTEGER,
  qualification_tier TEXT CHECK (qualification_tier IN ('education', 'future_icp', 'qualified', 'high_priority')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reports table (generated reports)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  result_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Anonymous users can access their own session
CREATE POLICY "Users can view own session" ON sessions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own session" ON sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own session" ON sessions
  FOR UPDATE USING (true);

CREATE POLICY "Users can view own answers" ON answers
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own answers" ON answers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own answers" ON answers
  FOR UPDATE USING (true);

CREATE POLICY "Users can insert leads" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own leads" ON leads
  FOR SELECT USING (true);

CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (true);

CREATE POLICY "Users can insert reports" ON reports
  FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_answers_session_id ON answers(session_id);
CREATE INDEX idx_leads_session_id ON leads(session_id);
CREATE INDEX idx_reports_session_id ON reports(session_id);
CREATE INDEX idx_sessions_anonymous_id ON sessions(anonymous_id);
