import { createClient } from '@/lib/supabase/server'
import { createClient as createClientBrowser } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database'

type Expense = Database['public']['Tables']['expenses']['Row']
type ExpenseInsert = Database['public']['Tables']['expenses']['Insert']
type ExpenseUpdate = Database['public']['Tables']['expenses']['Update']

// Server-side functions
export async function getExpenses(planId: string, userId: string): Promise<Expense[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('plan_id', planId)
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch expenses: ${error.message}`)
  }

  return data || []
}

export async function getExpensesByUser(userId: string): Promise<Expense[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch expenses: ${error.message}`)
  }

  return data || []
}

export async function createExpense(expense: ExpenseInsert): Promise<Expense> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create expense: ${error.message}`)
  }

  return data
}

export async function updateExpense(expenseId: string, userId: string, updates: ExpenseUpdate): Promise<Expense> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', expenseId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update expense: ${error.message}`)
  }

  return data
}

export async function deleteExpense(expenseId: string, userId: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to delete expense: ${error.message}`)
  }
}

export async function getExpenseSummary(planId: string, userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('expenses')
    .select('category, amount')
    .eq('plan_id', planId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to fetch expense summary: ${error.message}`)
  }

  const summary = data?.reduce((acc, expense) => {
    const category = expense.category
    acc[category] = (acc[category] || 0) + expense.amount
    acc.total = (acc.total || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)

  return summary || {}
}

// Client-side functions
export function createExpenseClient(expense: ExpenseInsert) {
  const supabase = createClientBrowser()
  
  return supabase
    .from('expenses')
    .insert(expense)
    .select()
    .single()
}

export function updateExpenseClient(expenseId: string, updates: ExpenseUpdate) {
  const supabase = createClientBrowser()
  
  return supabase
    .from('expenses')
    .update(updates)
    .eq('id', expenseId)
    .select()
    .single()
}

export function deleteExpenseClient(expenseId: string) {
  const supabase = createClientBrowser()
  
  return supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId)
}

