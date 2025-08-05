-- Migration: fix_profiles_table_defaults
-- Created at: 1754343686

-- Ensure profiles table has proper defaults and constraints
ALTER TABLE profiles 
ALTER COLUMN games_played SET DEFAULT 0,
ALTER COLUMN total_score SET DEFAULT 0,
ALTER COLUMN judge_games_played SET DEFAULT 0,
ALTER COLUMN judge_wins SET DEFAULT 0,
ALTER COLUMN prosecutor_games_played SET DEFAULT 0,
ALTER COLUMN prosecutor_wins SET DEFAULT 0,
ALTER COLUMN defense_games_played SET DEFAULT 0,
ALTER COLUMN defense_wins SET DEFAULT 0,
ALTER COLUMN current_win_streak SET DEFAULT 0,
ALTER COLUMN longest_win_streak SET DEFAULT 0,
ALTER COLUMN average_score SET DEFAULT 0,
ALTER COLUMN total_play_time_minutes SET DEFAULT 0;;