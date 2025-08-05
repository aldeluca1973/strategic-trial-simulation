import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://frgacnilaymjjthobztp.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyZ2FjbmlsYXltamp0aG9ienRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNDcyMjQsImV4cCI6MjA2OTgyMzIyNH0.6nANNAu4j_S0Ne8busky8hhkH4uQDBGJpLsVvqTMJ2o'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface Profile {
  id: string
  email?: string
  full_name?: string
  avatar_url?: string
  preferred_role?: 'judge' | 'prosecutor' | 'defense'
  preferred_role_1?: 'judge' | 'prosecutor' | 'defense'
  preferred_role_2?: 'judge' | 'prosecutor' | 'defense'
  preferred_role_3?: 'judge' | 'prosecutor' | 'defense'
  games_played: number
  total_score: number
  judge_games_played: number
  judge_wins: number
  prosecutor_games_played: number
  prosecutor_wins: number
  defense_games_played: number
  defense_wins: number
  current_win_streak: number
  longest_win_streak: number
  average_score: number
  favorite_case_id?: string
  total_play_time_minutes: number
  created_at: string
  updated_at: string
}

export interface LegalCase {
  id: string
  case_name: string
  year?: number
  location?: string
  case_background: string
  key_evidence: Array<{
    evidence_name?: string
    description: string
  }>
  witness_testimonies: Array<{
    witness_name?: string
    testimony: string
  }>
  legal_arguments: {
    prosecution?: string[]
    defense?: string[]
    general?: string
  }
  court_proceedings?: string
  notable_precedents: string[]
  source_url?: string
  difficulty_level: number
  case_category: string
  is_active: boolean
  created_at: string
}

export interface GameSession {
  id: string
  room_code: string
  host_user_id: string
  case_id: string
  current_phase: 'lobby' | 'pre_trial' | 'opening_statements' | 'evidence_presentation' | 'witness_examination' | 'closing_arguments' | 'deliberation' | 'verdict' | 'completed'
  max_players: number
  is_active: boolean
  started_at?: string
  completed_at?: string
  game_settings: {
    selectedCase?: LegalCase
    allowSpectators?: boolean
    timeLimit?: number
  }
  created_at: string
  updated_at: string
}

export interface GameParticipant {
  id: string
  game_session_id: string
  user_id?: string
  role: 'judge' | 'prosecutor' | 'defense' | 'spectator'
  join_order: number
  is_connected: boolean
  score: number
  performance_data: Record<string, any>
  joined_at: string
  last_activity: string
}

export interface AIJuryEvaluation {
  id: string
  game_session_id: string
  evaluation_phase: string
  evaluated_user_id?: string
  evaluation_criteria: string
  score: number
  reasoning?: string
  feedback_message?: string
  evaluation_data: {
    playerScores?: Record<string, number>
    educationalInsights?: string
    dramaTier?: number
    fullResponse?: any
  }
  created_at: string
}

export interface GameAction {
  id: string
  game_session_id: string
  user_id?: string
  action_type: string
  action_data: Record<string, any>
  game_phase: string
  timestamp: string
  sequence_number: number
}

export interface EvidencePresentation {
  id: string
  game_session_id: string
  presented_by_user_id: string
  evidence_data: Record<string, any>
  presentation_phase: string
  ai_evaluation_score?: number
  effectiveness_rating?: number
  presented_at: string
}

export interface GameChatMessage {
  id: string
  game_session_id: string
  user_id: string
  message_text: string
  message_type: 'general' | 'objection' | 'sidebar' | 'system'
  is_private: boolean
  recipient_role?: string
  sent_at: string
}

export interface CaseStatistics {
  id: string
  case_id: string
  total_games_played: number
  prosecution_wins: number
  defense_wins: number
  average_game_duration_minutes: number
  last_played_at?: string
  created_at: string
  updated_at: string
}

export interface PlayerAchievement {
  id: string
  user_id: string
  achievement_type: string
  achievement_name: string
  achievement_description?: string
  earned_at: string
  game_session_id?: string
  metadata: Record<string, any>
}

// New Career System Types
export interface PlayerProfile {
  id: string
  full_name?: string
  career_rank: number
  experience_points: number
  total_cases_won: number
  total_cases_played: number
  current_level_xp: number
  next_level_xp: number
  specialization?: string
  career_start_date: string
  reputation_score: number
  created_at: string
  updated_at: string
}

export interface TrainingModule {
  id: number
  title: string
  description: string
  content: string
  duration_minutes: number
  difficulty_level: number
  order_sequence: number
  prerequisites: string[]
  learning_objectives: string[]
  is_required: boolean
  category: string
  created_at: string
}

export interface PlayerTrainingProgress {
  id: number
  player_id: string
  module_id: number
  completed_at: string
  completion_time_minutes: number
  quiz_score?: number
}

export interface CareerCase {
  id: number
  title: string
  description: string
  difficulty_level: number
  required_rank: number
  experience_reward: number
  case_type: string
  estimated_duration_minutes: number
  case_data: Record<string, any>
  is_active: boolean
  created_at: string
}

export interface PremiumContentBundle {
  id: string
  name: string
  description: string
  price: number
  currency: string
  case_count: number
  preview_cases: string[]
  bundle_data: Record<string, any>
  is_active: boolean
  created_at: string
}