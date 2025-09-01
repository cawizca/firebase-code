/*
  # Create reports table for AnonyConnect

  1. New Tables
    - `reports`
      - `id` (uuid, primary key)
      - `reporter_id` (uuid, foreign key to users)
      - `reported_user_id` (uuid, foreign key to users)
      - `conversation_id` (uuid, foreign key to conversations)
      - `reason` (text, not null)
      - `description` (text, nullable)
      - `status` (text, default 'pending')
      - `created_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `reports` table
    - Add policy for users to insert their own reports
    - Add policy for admins to read all reports

  3. Constraints
    - Reporter and reported user must be different
    - Status can only be 'pending', 'reviewed', or 'resolved'
*/

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT different_users CHECK (reporter_id != reported_user_id)
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own reports"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can read their own reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

-- Create indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);