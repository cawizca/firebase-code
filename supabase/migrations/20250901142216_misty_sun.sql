/*
  # Create conversations table for AnonyConnect

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `participant_1` (uuid, foreign key to users)
      - `participant_2` (uuid, foreign key to users)
      - `status` (text, default 'active')
      - `created_at` (timestamptz, default now)
      - `ended_at` (timestamptz, nullable)

  2. Security
    - Enable RLS on `conversations` table
    - Add policy for participants to read their conversations
    - Add policy for participants to update their conversations

  3. Constraints
    - Ensure participants are different users
    - Status can only be 'active' or 'ended'
*/

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_2 uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  created_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  CONSTRAINT different_participants CHECK (participant_1 != participant_2)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read their conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Participants can update their conversations"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "System can insert conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON conversations(participant_1);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON conversations(participant_2);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_active ON conversations(participant_1, participant_2) WHERE status = 'active';