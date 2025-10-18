import { createClient } from '@/lib/supabase/server'
import { createClient as createClientBrowser } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database'

type TravelPlan = Database['public']['Tables']['travel_plans']['Row']
type TravelPlanInsert = Database['public']['Tables']['travel_plans']['Insert']
type TravelPlanUpdate = Database['public']['Tables']['travel_plans']['Update']

// Server-side functions
export async function getPlans(userId: string): Promise<TravelPlan[]> {
  const supabase =  await createClient()
  
  const { data, error } = await supabase
    .from('travel_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch plans: ${error.message}`)
  }

  return data || []
}

export async function getPlanById(planId: string, userId: string): Promise<TravelPlan | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('travel_plans')
    .select('*')
    .eq('id', planId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch plan: ${error.message}`)
  }

  return data
}

export async function createPlan(plan: TravelPlanInsert): Promise<TravelPlan> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('travel_plans')
    .insert(plan)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create plan: ${error.message}`)
  }

  return data
}

export async function updatePlan(planId: string, userId: string, updates: TravelPlanUpdate): Promise<TravelPlan> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('travel_plans')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', planId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update plan: ${error.message}`)
  }

  return data
}

export async function deletePlan(planId: string, userId: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('travel_plans')
    .delete()
    .eq('id', planId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to delete plan: ${error.message}`)
  }
}

// Client-side functions
export function createPlanClient(plan: TravelPlanInsert) {
  const supabase = createClientBrowser()
  
  return supabase
    .from('travel_plans')
    .insert(plan)
    .select()
    .single()
}

export function updatePlanClient(planId: string, updates: TravelPlanUpdate) {
  const supabase = createClientBrowser()
  
  return supabase
    .from('travel_plans')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', planId)
    .select()
    .single()
}

export function deletePlanClient(planId: string) {
  const supabase = createClientBrowser()
  
  return supabase
    .from('travel_plans')
    .delete()
    .eq('id', planId)
}

