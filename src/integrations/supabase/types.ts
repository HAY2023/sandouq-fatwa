export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_credentials: {
        Row: {
          created_at: string
          id: string
          password_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          password_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          password_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          message: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          message: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          message?: string
          type?: string
        }
        Relationships: []
      }
      flash_messages: {
        Row: {
          color: string
          created_at: string
          end_date: string | null
          font_size: string | null
          id: string
          is_active: boolean
          message: string
          start_date: string | null
          text_direction: string
        }
        Insert: {
          color?: string
          created_at?: string
          end_date?: string | null
          font_size?: string | null
          id?: string
          is_active?: boolean
          message: string
          start_date?: string | null
          text_direction?: string
        }
        Update: {
          color?: string
          created_at?: string
          end_date?: string | null
          font_size?: string | null
          id?: string
          is_active?: boolean
          message?: string
          start_date?: string | null
          text_direction?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          admin_fcm_token: string | null
          created_at: string | null
          id: string
          notify_every_n_questions: number | null
          notify_on_question: boolean | null
          questions_since_last_notification: number | null
          updated_at: string | null
        }
        Insert: {
          admin_fcm_token?: string | null
          created_at?: string | null
          id?: string
          notify_every_n_questions?: number | null
          notify_on_question?: boolean | null
          questions_since_last_notification?: number | null
          updated_at?: string | null
        }
        Update: {
          admin_fcm_token?: string | null
          created_at?: string | null
          id?: string
          notify_every_n_questions?: number | null
          notify_on_question?: boolean | null
          questions_since_last_notification?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          category: string
          created_at: string
          id: string
          question_text: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          question_text: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          question_text?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          id: string
          is_box_open: boolean
          next_session_date: string | null
          show_countdown: boolean
          show_question_count: boolean | null
          updated_at: string
          video_title: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_box_open?: boolean
          next_session_date?: string | null
          show_countdown?: boolean
          show_question_count?: boolean | null
          updated_at?: string
          video_title?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_box_open?: boolean
          next_session_date?: string | null
          show_countdown?: boolean
          show_question_count?: boolean | null
          updated_at?: string
          video_title?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          title: string
          url: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          title: string
          url: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          title?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_announcement_authenticated: {
        Args: { p_message: string; p_password: string; p_type?: string }
        Returns: string
      }
      add_flash_message_authenticated:
        | {
            Args: {
              p_color?: string
              p_end_date?: string
              p_message: string
              p_password: string
              p_start_date?: string
              p_text_direction?: string
            }
            Returns: string
          }
        | {
            Args: {
              p_color?: string
              p_end_date?: string
              p_font_size?: string
              p_message: string
              p_password: string
              p_start_date?: string
              p_text_direction?: string
            }
            Returns: string
          }
      add_video_authenticated: {
        Args: { p_password: string; p_title: string; p_url: string }
        Returns: string
      }
      delete_all_questions_authenticated: {
        Args: { p_password: string }
        Returns: boolean
      }
      delete_announcement_authenticated: {
        Args: { p_announcement_id: string; p_password: string }
        Returns: boolean
      }
      delete_flash_message_authenticated: {
        Args: { p_flash_message_id: string; p_password: string }
        Returns: boolean
      }
      delete_selected_questions_authenticated: {
        Args: { p_password: string; p_question_ids: string[] }
        Returns: boolean
      }
      delete_video_authenticated: {
        Args: { p_password: string; p_video_id: string }
        Returns: boolean
      }
      get_public_questions_count: { Args: never; Returns: number }
      get_questions_authenticated: {
        Args: { p_password: string }
        Returns: {
          category: string
          created_at: string
          id: string
          question_text: string
        }[]
      }
      get_questions_count_authenticated: {
        Args: { p_password: string }
        Returns: number
      }
      reorder_videos_authenticated: {
        Args: { p_password: string; p_video_ids: string[] }
        Returns: boolean
      }
      update_admin_password: {
        Args: { p_new_password: string; p_old_password: string }
        Returns: boolean
      }
      update_notification_settings_authenticated: {
        Args: {
          p_admin_fcm_token?: string
          p_notify_every_n_questions?: number
          p_notify_on_question?: boolean
          p_password: string
        }
        Returns: boolean
      }
      update_settings_authenticated: {
        Args: {
          p_is_box_open?: boolean
          p_next_session_date?: string
          p_password: string
          p_show_countdown?: boolean
          p_show_question_count?: boolean
          p_video_title?: string
          p_video_url?: string
        }
        Returns: boolean
      }
      verify_admin_password: {
        Args: { input_password: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
