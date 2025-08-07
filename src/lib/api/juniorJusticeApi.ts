import { supabase } from '@/lib/supabase'

export interface JuniorCase {
  id: string
  case_id: string
  title: string
  emoji: string
  setting: string
  problem: string
  solution: string
  characters: JuniorCharacter[]
  evidence: JuniorEvidence[]
}

export interface JuniorCharacter {
  name: string
  emoji: string
  side: string
  story: string
}

export interface JuniorEvidence {
  id: string
  evidence_id: string
  name: string
  emoji: string
  description: string
  helpful: boolean
}

export interface JuniorUserProgress {
  id: string
  user_id: string
  case_id: string
  completed: boolean
  selected_evidence: string[]
  badges_earned: string[]
  score: number
  completed_at?: string
}

// Fetch all Junior Justice cases with characters and evidence
export async function fetchJuniorJusticeCases(): Promise<JuniorCase[]> {
  try {
    // Fetch cases
    const { data: cases, error: casesError } = await supabase
      .from('junior_justice_cases')
      .select('*')
      .order('created_at', { ascending: true })

    if (casesError) throw casesError
    if (!cases) return []

    // Fetch characters for all cases
    const { data: characters, error: charactersError } = await supabase
      .from('junior_justice_characters')
      .select('*')
      .order('created_at', { ascending: true })

    if (charactersError) throw charactersError

    // Fetch evidence for all cases
    const { data: evidence, error: evidenceError } = await supabase
      .from('junior_justice_evidence')
      .select('*')
      .order('created_at', { ascending: true })

    if (evidenceError) throw evidenceError

    // Combine data
    const casesWithDetails: JuniorCase[] = cases.map(case_ => ({
      ...case_,
      id: case_.case_id,
      characters: characters?.filter(char => char.case_id === case_.case_id) || [],
      evidence: evidence?.filter(ev => ev.case_id === case_.case_id) || []
    }))

    return casesWithDetails
  } catch (error) {
    console.error('Error fetching Junior Justice cases:', error)
    throw error
  }
}

// Fetch user progress for Junior Justice
export async function fetchJuniorProgress(userId: string): Promise<JuniorUserProgress[]> {
  try {
    const { data, error } = await supabase
      .from('junior_justice_user_progress')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching Junior Justice progress:', error)
    throw error
  }
}

// Save user progress for Junior Justice
export async function saveJuniorProgress(
  userId: string,
  caseId: string,
  selectedEvidence: string[],
  badgesEarned: string[],
  score: number
): Promise<void> {
  try {
    const { error } = await supabase
      .from('junior_justice_user_progress')
      .upsert({
        user_id: userId,
        case_id: caseId,
        completed: true,
        selected_evidence: selectedEvidence,
        badges_earned: badgesEarned,
        score: score,
        completed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,case_id'
      })

    if (error) throw error
  } catch (error) {
    console.error('Error saving Junior Justice progress:', error)
    throw error
  }
}

// Get user badges across all cases
export async function getUserBadges(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('junior_justice_user_progress')
      .select('badges_earned')
      .eq('user_id', userId)
      .eq('completed', true)

    if (error) throw error
    if (!data) return []

    // Flatten and deduplicate badges
    const allBadges = data.flatMap(progress => progress.badges_earned || [])
    return [...new Set(allBadges)]
  } catch (error) {
    console.error('Error fetching user badges:', error)
    return []
  }
}