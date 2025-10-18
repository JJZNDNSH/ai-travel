export interface Database {
  public: {
    Tables: {
      travel_plans: {
        Row: {
          id: string
          user_id: string
          title: string
          destination: string
          start_date: string
          end_date: string
          budget: number
          travelers: number
          preferences: string
          itinerary: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          destination: string
          start_date: string
          end_date: string
          budget: number
          travelers: number
          preferences: string
          itinerary?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          destination?: string
          start_date?: string
          end_date?: string
          budget?: number
          travelers?: number
          preferences?: string
          itinerary?: any
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          plan_id: string
          user_id: string
          category: string
          description: string
          amount: number
          currency: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          user_id: string
          category: string
          description: string
          amount: number
          currency?: string
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          user_id?: string
          category?: string
          description?: string
          amount?: number
          currency?: string
          date?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

