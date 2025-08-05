import { supabase } from '@/lib/supabase'

export interface MasterCase {
  id: string
  case_id: string
  title: string
  type: string
  complexity: number
  time_estimate: string
  description: string
  legal_issues: string[]
  stakeholders: string[]
  precedents: string[]
}

export interface LegalMasterProgress {
  id: string
  user_id: string
  case_id: string
  phase_progress: Record<string, number>
  professional_score: number
  session_time: number
  completed: boolean
  completed_at?: string
}

// Fetch all Legal Master cases with related data
export async function fetchLegalMasterCases(): Promise<MasterCase[]> {
  try {
    // Fetch cases
    const { data: cases, error: casesError } = await supabase
      .from('legal_master_cases')
      .select('*')
      .order('created_at', { ascending: true })

    if (casesError) throw casesError
    if (!cases) return []

    // Fetch legal issues for all cases
    const { data: issues, error: issuesError } = await supabase
      .from('legal_master_issues')
      .select('*')
      .order('created_at', { ascending: true })

    if (issuesError) throw issuesError

    // Fetch stakeholders for all cases
    const { data: stakeholders, error: stakeholdersError } = await supabase
      .from('legal_master_stakeholders')
      .select('*')
      .order('created_at', { ascending: true })

    if (stakeholdersError) throw stakeholdersError

    // Fetch precedents for all cases
    const { data: precedents, error: precedentsError } = await supabase
      .from('legal_master_precedents')
      .select('*')
      .order('created_at', { ascending: true })

    if (precedentsError) throw precedentsError

    // Combine data
    const casesWithDetails: MasterCase[] = cases.map(case_ => ({
      ...case_,
      id: case_.case_id,
      legal_issues: issues?.filter(issue => issue.case_id === case_.case_id).map(i => i.issue) || [],
      stakeholders: stakeholders?.filter(stakeholder => stakeholder.case_id === case_.case_id).map(s => s.stakeholder) || [],
      precedents: precedents?.filter(precedent => precedent.case_id === case_.case_id).map(p => p.precedent) || []
    }))

    return casesWithDetails
  } catch (error) {
    console.error('Error fetching Legal Master cases:', error)
    throw error
  }
}

// Create progress tracking table for Legal Master mode
export async function createLegalMasterProgressTable(): Promise<void> {
  try {
    // This would typically be done via migration, but including for completeness
    const { error } = await supabase.rpc('create_legal_master_progress_table')
    if (error) throw error
  } catch (error) {
    console.error('Error creating Legal Master progress table:', error)
    // Silently fail if table already exists
  }
}

// Save Legal Master progress
export async function saveLegalMasterProgress(
  userId: string,
  caseId: string,
  phaseProgress: Record<string, number>,
  professionalScore: number,
  sessionTime: number,
  completed: boolean = false
): Promise<void> {
  try {
    const { error } = await supabase
      .from('legal_master_progress')
      .upsert({
        user_id: userId,
        case_id: caseId,
        phase_progress: phaseProgress,
        professional_score: professionalScore,
        session_time: sessionTime,
        completed: completed,
        completed_at: completed ? new Date().toISOString() : null
      }, {
        onConflict: 'user_id,case_id'
      })

    if (error) throw error
  } catch (error) {
    console.error('Error saving Legal Master progress:', error)
    throw error
  }
}

// Fetch Legal Master progress for user
export async function fetchLegalMasterProgress(userId: string): Promise<LegalMasterProgress[]> {
  try {
    const { data, error } = await supabase
      .from('legal_master_progress')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching Legal Master progress:', error)
    return []
  }
}

// Get user's professional statistics
export async function getUserProfessionalStats(userId: string): Promise<{
  totalCases: number
  completedCases: number
  averageScore: number
  totalTime: number
}> {
  try {
    const progress = await fetchLegalMasterProgress(userId)
    
    const totalCases = progress.length
    const completedCases = progress.filter(p => p.completed).length
    const averageScore = completedCases > 0 
      ? progress.filter(p => p.completed).reduce((sum, p) => sum + p.professional_score, 0) / completedCases 
      : 0
    const totalTime = progress.reduce((sum, p) => sum + p.session_time, 0)

    return {
      totalCases,
      completedCases,
      averageScore: Math.round(averageScore),
      totalTime
    }
  } catch (error) {
    console.error('Error fetching professional stats:', error)
    return { totalCases: 0, completedCases: 0, averageScore: 0, totalTime: 0 }
  }
}