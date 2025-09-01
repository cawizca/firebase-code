/*
  # Create blocked_users table for AnonyConnect

  1. New Tables
    - `blocked_users`
      - `id` (uuid, primary key)
      - `blocker_id` (uuid, foreign key to users)
      - `blocked_user_id` (uuid, foreign key to users)
      - `created_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `blocked_users` table
    - Add policy for users to manage their own blocks

  3. Constraints
    - Blocker and blocked user must be different
    - Unique constraint to prevent duplicate blocks
*/

CREATE TABLE IF NOT EXISTS blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT different_block_users CHECK (blocker_id != blocked_user_id),
  CONSTRAINT unique_block UNIQUE (blocker_id, blocked_user_id)
);

ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own blocks"
  ON blocked_users
  FOR ALL
  TO authenticated
  USING (auth.uid() = blocker_id)
  WITH CHECK (auth.uid() = blocker_id);

-- Create index for faster block checks
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users(blocked_user_id);