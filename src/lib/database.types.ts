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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      aid_requests: {
        Row: {
          created_at: string
          dogs_nearby: boolean
          email: string | null
          household_size: number
          id: string
          island: Database["public"]["Enums"]["island"]
          landline_phone: string | null
          mobile_phone: string | null
          name: string
          needs: Database["public"]["Enums"]["service_type"][]
          no_contact_explanation: string | null
          notes: string | null
          responded_by: string | null
          safely_accessible: Database["public"]["Enums"]["accessible_status"]
          status: Database["public"]["Enums"]["aid_request_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          dogs_nearby?: boolean
          email?: string | null
          household_size?: number
          id?: string
          island: Database["public"]["Enums"]["island"]
          landline_phone?: string | null
          mobile_phone?: string | null
          name: string
          needs?: Database["public"]["Enums"]["service_type"][]
          no_contact_explanation?: string | null
          notes?: string | null
          responded_by?: string | null
          safely_accessible?: Database["public"]["Enums"]["accessible_status"]
          status?: Database["public"]["Enums"]["aid_request_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          dogs_nearby?: boolean
          email?: string | null
          household_size?: number
          id?: string
          island?: Database["public"]["Enums"]["island"]
          landline_phone?: string | null
          mobile_phone?: string | null
          name?: string
          needs?: Database["public"]["Enums"]["service_type"][]
          no_contact_explanation?: string | null
          notes?: string | null
          responded_by?: string | null
          safely_accessible?: Database["public"]["Enums"]["accessible_status"]
          status?: Database["public"]["Enums"]["aid_request_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aid_requests_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      offerings: {
        Row: {
          capacity_text: string | null
          created_at: string
          description: string | null
          hours_text: string | null
          id: string
          island: Database["public"]["Enums"]["island"]
          location_lat: number | null
          location_lng: number | null
          location_text: string
          name: string
          organization_id: string
          planned_end: string | null
          planned_start: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          status: Database["public"]["Enums"]["offering_status"]
          updated_at: string
        }
        Insert: {
          capacity_text?: string | null
          created_at?: string
          description?: string | null
          hours_text?: string | null
          id?: string
          island: Database["public"]["Enums"]["island"]
          location_lat?: number | null
          location_lng?: number | null
          location_text: string
          name: string
          organization_id: string
          planned_end?: string | null
          planned_start?: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["offering_status"]
          updated_at?: string
        }
        Update: {
          capacity_text?: string | null
          created_at?: string
          description?: string | null
          hours_text?: string | null
          id?: string
          island?: Database["public"]["Enums"]["island"]
          location_lat?: number | null
          location_lng?: number | null
          location_text?: string
          name?: string
          organization_id?: string
          planned_end?: string | null
          planned_start?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["offering_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offerings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          islands: Database["public"]["Enums"]["island"][]
          location_lat: number | null
          location_lng: number | null
          mailing_address: string | null
          name: string
          physical_address: string | null
          service_types: Database["public"]["Enums"]["service_type"][]
          updated_at: string
          user_id: string | null
          verification_requested: boolean
          verified: boolean
          whatsapp: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          islands?: Database["public"]["Enums"]["island"][]
          location_lat?: number | null
          location_lng?: number | null
          mailing_address?: string | null
          name: string
          physical_address?: string | null
          service_types?: Database["public"]["Enums"]["service_type"][]
          updated_at?: string
          user_id?: string | null
          verification_requested?: boolean
          verified?: boolean
          whatsapp?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          islands?: Database["public"]["Enums"]["island"][]
          location_lat?: number | null
          location_lng?: number | null
          mailing_address?: string | null
          name?: string
          physical_address?: string | null
          service_types?: Database["public"]["Enums"]["service_type"][]
          updated_at?: string
          user_id?: string | null
          verification_requested?: boolean
          verified?: boolean
          whatsapp?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          clerk_user_id: string | null
          created_at: string
          display_name: string
          id: string
          role: string
        }
        Insert: {
          avatar_url?: string | null
          clerk_user_id?: string | null
          created_at?: string
          display_name: string
          id: string
          role?: string
        }
        Update: {
          avatar_url?: string | null
          clerk_user_id?: string | null
          created_at?: string
          display_name?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      recipients: {
        Row: {
          contact_method: string | null
          created_at: string
          id: string
          island: Database["public"]["Enums"]["island"]
          name: string
          needs: Database["public"]["Enums"]["service_type"][]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          contact_method?: string | null
          created_at?: string
          id?: string
          island: Database["public"]["Enums"]["island"]
          name: string
          needs?: Database["public"]["Enums"]["service_type"][]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          contact_method?: string | null
          created_at?: string
          id?: string
          island?: Database["public"]["Enums"]["island"]
          name?: string
          needs?: Database["public"]["Enums"]["service_type"][]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      volunteer_leader_signups: {
        Row: {
          availability: Database["public"]["Enums"]["volunteer_availability"][]
          contact: string | null
          created_at: string
          display_name: string | null
          experience: string | null
          id: string
          is_public: boolean
          island: Database["public"]["Enums"]["island"] | null
          notes: string | null
          privacy_acknowledged: boolean
          skills: Database["public"]["Enums"]["volunteer_skill"][]
          team_capacity: number | null
        }
        Insert: {
          availability?: Database["public"]["Enums"]["volunteer_availability"][]
          contact?: string | null
          created_at?: string
          display_name?: string | null
          experience?: string | null
          id?: string
          is_public?: boolean
          island?: Database["public"]["Enums"]["island"] | null
          notes?: string | null
          privacy_acknowledged: boolean
          skills?: Database["public"]["Enums"]["volunteer_skill"][]
          team_capacity?: number | null
        }
        Update: {
          availability?: Database["public"]["Enums"]["volunteer_availability"][]
          contact?: string | null
          created_at?: string
          display_name?: string | null
          experience?: string | null
          id?: string
          is_public?: boolean
          island?: Database["public"]["Enums"]["island"] | null
          notes?: string | null
          privacy_acknowledged?: boolean
          skills?: Database["public"]["Enums"]["volunteer_skill"][]
          team_capacity?: number | null
        }
        Relationships: []
      }
      volunteer_sheets: {
        Row: {
          capacity: number | null
          contact_info: string | null
          created_at: string
          date_text: string | null
          description: string | null
          id: string
          island: Database["public"]["Enums"]["island"]
          organization_name: string
          signup_count: number
          skills_needed: Database["public"]["Enums"]["volunteer_skill"][]
          status: Database["public"]["Enums"]["offering_status"]
          title: string
        }
        Insert: {
          capacity?: number | null
          contact_info?: string | null
          created_at?: string
          date_text?: string | null
          description?: string | null
          id?: string
          island: Database["public"]["Enums"]["island"]
          organization_name: string
          signup_count?: number
          skills_needed?: Database["public"]["Enums"]["volunteer_skill"][]
          status?: Database["public"]["Enums"]["offering_status"]
          title: string
        }
        Update: {
          capacity?: number | null
          contact_info?: string | null
          created_at?: string
          date_text?: string | null
          description?: string | null
          id?: string
          island?: Database["public"]["Enums"]["island"]
          organization_name?: string
          signup_count?: number
          skills_needed?: Database["public"]["Enums"]["volunteer_skill"][]
          status?: Database["public"]["Enums"]["offering_status"]
          title?: string
        }
        Relationships: []
      }
      volunteer_signups: {
        Row: {
          availability: Database["public"]["Enums"]["volunteer_availability"][]
          contact: string | null
          created_at: string
          display_name: string | null
          id: string
          is_public: boolean
          island: Database["public"]["Enums"]["island"] | null
          notes: string | null
          privacy_acknowledged: boolean
          sheet_id: string | null
          skills: Database["public"]["Enums"]["volunteer_skill"][]
        }
        Insert: {
          availability?: Database["public"]["Enums"]["volunteer_availability"][]
          contact?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_public?: boolean
          island?: Database["public"]["Enums"]["island"] | null
          notes?: string | null
          privacy_acknowledged?: boolean
          sheet_id?: string | null
          skills?: Database["public"]["Enums"]["volunteer_skill"][]
        }
        Update: {
          availability?: Database["public"]["Enums"]["volunteer_availability"][]
          contact?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_public?: boolean
          island?: Database["public"]["Enums"]["island"] | null
          notes?: string | null
          privacy_acknowledged?: boolean
          sheet_id?: string | null
          skills?: Database["public"]["Enums"]["volunteer_skill"][]
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_signups_sheet_id_fkey"
            columns: ["sheet_id"]
            isOneToOne: false
            referencedRelation: "volunteer_sheets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      accessible_status: "yes" | "no" | "unsure"
      aid_request_status: "open" | "responding" | "fulfilled" | "unable"
      island: "guam" | "saipan" | "tinian" | "rota"
      offering_status: "active" | "planned" | "closed"
      service_type:
        | "shelter"
        | "food"
        | "water"
        | "medical"
        | "tarps"
        | "cleanup"
        | "clothing"
        | "transportation"
        | "information"
      volunteer_availability:
        | "weekday_mornings"
        | "weekday_afternoons"
        | "weekday_evenings"
        | "weekend_mornings"
        | "weekend_afternoons"
        | "weekend_evenings"
        | "anytime"
      volunteer_skill:
        | "cleanup"
        | "food_distribution"
        | "shelter_management"
        | "transportation"
        | "medical_support"
        | "emotional_support"
        | "childcare"
        | "translation"
        | "general_labor"
        | "other"
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
    Enums: {
      accessible_status: ["yes", "no", "unsure"],
      aid_request_status: ["open", "responding", "fulfilled", "unable"],
      island: ["guam", "saipan", "tinian", "rota"],
      offering_status: ["active", "planned", "closed"],
      service_type: [
        "shelter",
        "food",
        "water",
        "medical",
        "tarps",
        "cleanup",
        "clothing",
        "transportation",
        "information",
      ],
      volunteer_availability: [
        "weekday_mornings",
        "weekday_afternoons",
        "weekday_evenings",
        "weekend_mornings",
        "weekend_afternoons",
        "weekend_evenings",
        "anytime",
      ],
      volunteer_skill: [
        "cleanup",
        "food_distribution",
        "shelter_management",
        "transportation",
        "medical_support",
        "emotional_support",
        "childcare",
        "translation",
        "general_labor",
        "other",
      ],
    },
  },
} as const
