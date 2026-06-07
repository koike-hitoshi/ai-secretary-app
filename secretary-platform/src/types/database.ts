export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type TaskPriority = 'high' | 'medium' | 'low'

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          due_date: string | null
          priority: TaskPriority
          completed: boolean
          alert_sent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          due_date?: string | null
          priority?: TaskPriority
          completed?: boolean
          alert_sent?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          due_date?: string | null
          priority?: TaskPriority
          completed?: boolean
          alert_sent?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      writing_style_profiles: {
        Row: {
          id: string
          user_id: string
          tone_description: string | null
          sample_excerpts: Json
          analyzed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tone_description?: string | null
          sample_excerpts?: Json
          analyzed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tone_description?: string | null
          sample_excerpts?: Json
          analyzed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      proofreading_history: {
        Row: {
          id: string
          user_id: string
          original_text: string
          corrected_text: string | null
          suggestions: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          original_text: string
          corrected_text?: string | null
          suggestions?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          original_text?: string
          corrected_text?: string | null
          suggestions?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      meeting_minutes: {
        Row: {
          id: string
          user_id: string
          title: string
          transcript: string | null
          discussed: string | null
          decisions: string | null
          next_actions: string | null
          audio_storage_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          transcript?: string | null
          discussed?: string | null
          decisions?: string | null
          next_actions?: string | null
          audio_storage_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          transcript?: string | null
          discussed?: string | null
          decisions?: string | null
          next_actions?: string | null
          audio_storage_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      research_sessions: {
        Row: {
          id: string
          user_id: string
          theme: string
          generated_prompt: string | null
          summary: string | null
          sources: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme: string
          generated_prompt?: string | null
          summary?: string | null
          sources?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: string
          generated_prompt?: string | null
          summary?: string | null
          sources?: Json
          created_at?: string
        }
        Relationships: []
      }
      google_calendar_tokens: {
        Row: {
          user_id: string
          access_token: string
          refresh_token: string | null
          expires_at: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          access_token: string
          refresh_token?: string | null
          expires_at?: string | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          access_token?: string
          refresh_token?: string | null
          expires_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      task_priority: TaskPriority
    }
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
