// Supabase client configuration for Educational RPG Tutor

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types for better TypeScript support
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          age: number;
          parent_id: string | null;
          parental_consent_given: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          age: number;
          parent_id?: string | null;
          parental_consent_given?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          age?: number;
          parent_id?: string | null;
          parental_consent_given?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      characters: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          avatar_config: any;
          level: number;
          total_xp: number;
          current_xp: number;
          specialization: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          avatar_config?: any;
          level?: number;
          total_xp?: number;
          current_xp?: number;
          specialization?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          avatar_config?: any;
          level?: number;
          total_xp?: number;
          current_xp?: number;
          specialization?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      character_stats: {
        Row: {
          id: string;
          character_id: string;
          intelligence: number;
          vitality: number;
          wisdom: number;
          charisma: number;
          dexterity: number;
          creativity: number;
          available_points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          character_id: string;
          intelligence?: number;
          vitality?: number;
          wisdom?: number;
          charisma?: number;
          dexterity?: number;
          creativity?: number;
          available_points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          character_id?: string;
          intelligence?: number;
          vitality?: number;
          wisdom?: number;
          charisma?: number;
          dexterity?: number;
          creativity?: number;
          available_points?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      friends: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          status: string;
          created_at: string;
          accepted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          friend_id: string;
          status?: string;
          created_at?: string;
          accepted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          friend_id?: string;
          status?: string;
          created_at?: string;
          accepted_at?: string | null;
        };
      };
      learning_challenges: {
        Row: {
          id: string;
          title: string;
          description: string;
          subject_id: string;
          start_date: string;
          end_date: string;
          max_participants: number | null;
          xp_reward: number;
          status: string;
          created_by: string;
          requirements: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          subject_id: string;
          start_date: string;
          end_date: string;
          max_participants?: number | null;
          xp_reward: number;
          status?: string;
          created_by: string;
          requirements?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          subject_id?: string;
          start_date?: string;
          end_date?: string;
          max_participants?: number | null;
          xp_reward?: number;
          status?: string;
          created_by?: string;
          requirements?: any | null;
          created_at?: string;
        };
      };
      challenge_participants: {
        Row: {
          id: string;
          challenge_id: string;
          user_id: string;
          score: number;
          completed_at: string | null;
          rank: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          challenge_id: string;
          user_id: string;
          score?: number;
          completed_at?: string | null;
          rank?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          challenge_id?: string;
          user_id?: string;
          score?: number;
          completed_at?: string | null;
          rank?: number | null;
          created_at?: string;
        };
      };
      trade_requests: {
        Row: {
          id: string;
          from_user_id: string;
          to_user_id: string;
          from_items: any;
          to_items: any;
          status: string;
          created_at: string;
          expires_at: string;
          parental_approval_required: boolean;
          parental_approval_given: boolean | null;
        };
        Insert: {
          id?: string;
          from_user_id: string;
          to_user_id: string;
          from_items: any;
          to_items: any;
          status?: string;
          created_at?: string;
          expires_at: string;
          parental_approval_required?: boolean;
          parental_approval_given?: boolean | null;
        };
        Update: {
          id?: string;
          from_user_id?: string;
          to_user_id?: string;
          from_items?: any;
          to_items?: any;
          status?: string;
          created_at?: string;
          expires_at?: string;
          parental_approval_required?: boolean;
          parental_approval_given?: boolean | null;
        };
      };
      social_activities: {
        Row: {
          id: string;
          user_id: string;
          activity_type: string;
          description: string;
          related_user_id: string | null;
          related_item_id: string | null;
          created_at: string;
          is_read: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_type: string;
          description: string;
          related_user_id?: string | null;
          related_item_id?: string | null;
          created_at?: string;
          is_read?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_type?: string;
          description?: string;
          related_user_id?: string | null;
          related_item_id?: string | null;
          created_at?: string;
          is_read?: boolean;
        };
      };
      parental_controls: {
        Row: {
          id: string;
          user_id: string;
          parent_id: string;
          allow_friend_requests: boolean;
          allow_trading: boolean;
          allow_challenges: boolean;
          allow_leaderboards: boolean;
          restricted_users: string[];
          approval_required: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          parent_id: string;
          allow_friend_requests?: boolean;
          allow_trading?: boolean;
          allow_challenges?: boolean;
          allow_leaderboards?: boolean;
          restricted_users?: string[];
          approval_required?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          parent_id?: string;
          allow_friend_requests?: boolean;
          allow_trading?: boolean;
          allow_challenges?: boolean;
          allow_leaderboards?: boolean;
          restricted_users?: string[];
          approval_required?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      character_xp_logs: {
        Row: {
          id: string;
          user_id: string;
          character_id: string;
          xp_gained: number;
          source: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          character_id: string;
          xp_gained: number;
          source: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          character_id?: string;
          xp_gained?: number;
          source?: string;
          created_at?: string;
        };
      };
    };
    Functions: {
      calculate_xp_for_level: {
        Args: { target_level: number };
        Returns: number;
      };
      calculate_level_from_xp: {
        Args: { total_xp: number };
        Returns: number;
      };
      process_question_response: {
        Args: {
          user_uuid: string;
          question_uuid: string;
          selected_answer: string;
          response_time_seconds?: number;
        };
        Returns: any;
      };
      allocate_stat_points: {
        Args: {
          character_uuid: string;
          intelligence_points?: number;
          vitality_points?: number;
          wisdom_points?: number;
          charisma_points?: number;
          dexterity_points?: number;
          creativity_points?: number;
        };
        Returns: boolean;
      };
      execute_trade: {
        Args: {
          trade_request_id: string;
        };
        Returns: boolean;
      };
    };
  };
}