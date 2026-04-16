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
      announcements: {
        Row: {
          action_label: string | null
          action_url: string | null
          created_at: string
          id: string
          is_active: boolean
          message: string
          priority: number
          updated_at: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          message: string
          priority?: number
          updated_at?: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          message?: string
          priority?: number
          updated_at?: string
        }
        Relationships: []
      }
      community_confirmations: {
        Row: {
          author_name: string | null
          clerk_user_id: string | null
          created_at: string
          id: string
          is_anonymous: boolean
          message: string
          offering_id: string
        }
        Insert: {
          author_name?: string | null
          clerk_user_id?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean
          message: string
          offering_id: string
        }
        Update: {
          author_name?: string | null
          clerk_user_id?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean
          message?: string
          offering_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_confirmations_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      community_updates: {
        Row: {
          author_name: string
          body: string
          created_at: string
          id: string
          island: Database["public"]["Enums"]["island"]
          source_url: string | null
          status: string
          title: string
        }
        Insert: {
          author_name: string
          body: string
          created_at?: string
          id?: string
          island: Database["public"]["Enums"]["island"]
          source_url?: string | null
          status?: string
          title: string
        }
        Update: {
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          island?: Database["public"]["Enums"]["island"]
          source_url?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      donation_campaigns: {
        Row: {
          created_at: string
          description: string | null
          goal_amount: number | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          goal_amount?: number | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          goal_amount?: number | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      donation_pledges: {
        Row: {
          amount_pledged: string | null
          created_at: string
          email: string | null
          id: string
          island: string | null
          message: string | null
          name: string
          phone: string | null
        }
        Insert: {
          amount_pledged?: string | null
          created_at?: string
          email?: string | null
          id?: string
          island?: string | null
          message?: string | null
          name: string
          phone?: string | null
        }
        Update: {
          amount_pledged?: string | null
          created_at?: string
          email?: string | null
          id?: string
          island?: string | null
          message?: string | null
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          campaign_id: string | null
          created_at: string
          donor_email: string | null
          donor_name: string | null
          id: string
          is_public: boolean
          island_earmark: Database["public"]["Enums"]["island"] | null
          message: string | null
          payment_method: string
          status: string
          stripe_session_id: string | null
        }
        Insert: {
          amount: number
          campaign_id?: string | null
          created_at?: string
          donor_email?: string | null
          donor_name?: string | null
          id?: string
          is_public?: boolean
          island_earmark?: Database["public"]["Enums"]["island"] | null
          message?: string | null
          payment_method?: string
          status?: string
          stripe_session_id?: string | null
        }
        Update: {
          amount?: number
          campaign_id?: string | null
          created_at?: string
          donor_email?: string | null
          donor_name?: string | null
          id?: string
          is_public?: boolean
          island_earmark?: Database["public"]["Enums"]["island"] | null
          message?: string | null
          payment_method?: string
          status?: string
          stripe_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "donation_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      fund_leaders: {
        Row: {
          address: string
          approved_at: string | null
          approved_by: string | null
          clerk_user_id: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          display_name: string
          id: string
          intended_services: string | null
          island: Database["public"]["Enums"]["island"]
          notes: string | null
          organization_id: string | null
          status: string
        }
        Insert: {
          address: string
          approved_at?: string | null
          approved_by?: string | null
          clerk_user_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          display_name: string
          id?: string
          intended_services?: string | null
          island: Database["public"]["Enums"]["island"]
          notes?: string | null
          organization_id?: string | null
          status?: string
        }
        Update: {
          address?: string
          approved_at?: string | null
          approved_by?: string | null
          clerk_user_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          display_name?: string
          id?: string
          intended_services?: string | null
          island?: Database["public"]["Enums"]["island"]
          notes?: string | null
          organization_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fund_leaders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      fund_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          donation_id: string | null
          fund_leader_id: string
          id: string
          receipt_url: string | null
          recorded_by: string | null
          type: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          donation_id?: string | null
          fund_leader_id: string
          id?: string
          receipt_url?: string | null
          recorded_by?: string | null
          type: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          donation_id?: string | null
          fund_leader_id?: string
          id?: string
          receipt_url?: string | null
          recorded_by?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fund_transactions_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fund_transactions_fund_leader_id_fkey"
            columns: ["fund_leader_id"]
            isOneToOne: false
            referencedRelation: "fund_leader_balances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fund_transactions_fund_leader_id_fkey"
            columns: ["fund_leader_id"]
            isOneToOne: false
            referencedRelation: "fund_leaders"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles: {
        Row: {
          author_name: string | null
          body: string | null
          category: string
          created_at: string
          featured: boolean
          id: string
          image_url: string | null
          published_at: string | null
          source_url: string
          status: string
          summary: string | null
          title: string
        }
        Insert: {
          author_name?: string | null
          body?: string | null
          category?: string
          created_at?: string
          featured?: boolean
          id?: string
          image_url?: string | null
          published_at?: string | null
          source_url: string
          status?: string
          summary?: string | null
          title: string
        }
        Update: {
          author_name?: string | null
          body?: string | null
          category?: string
          created_at?: string
          featured?: boolean
          id?: string
          image_url?: string | null
          published_at?: string | null
          source_url?: string
          status?: string
          summary?: string | null
          title?: string
        }
        Relationships: []
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
      org_members: {
        Row: {
          clerk_user_id: string
          created_at: string
          display_name: string | null
          id: string
          organization_id: string
          role: string
          share_publicly: boolean
        }
        Insert: {
          clerk_user_id: string
          created_at?: string
          display_name?: string | null
          id?: string
          organization_id: string
          role?: string
          share_publicly?: boolean
        }
        Update: {
          clerk_user_id?: string
          created_at?: string
          display_name?: string | null
          id?: string
          organization_id?: string
          role?: string
          share_publicly?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "org_members_organization_id_fkey"
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
          hidden_from_map: boolean
          id: string
          is_archived: boolean
          islands: Database["public"]["Enums"]["island"][]
          location_lat: number | null
          location_lng: number | null
          mailing_address: string | null
          name: string
          org_category: Database["public"]["Enums"]["org_category"]
          physical_address: string | null
          service_hours: Json | null
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
          hidden_from_map?: boolean
          id?: string
          is_archived?: boolean
          islands?: Database["public"]["Enums"]["island"][]
          location_lat?: number | null
          location_lng?: number | null
          mailing_address?: string | null
          name: string
          org_category?: Database["public"]["Enums"]["org_category"]
          physical_address?: string | null
          service_hours?: Json | null
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
          hidden_from_map?: boolean
          id?: string
          is_archived?: boolean
          islands?: Database["public"]["Enums"]["island"][]
          location_lat?: number | null
          location_lng?: number | null
          mailing_address?: string | null
          name?: string
          org_category?: Database["public"]["Enums"]["org_category"]
          physical_address?: string | null
          service_hours?: Json | null
          service_types?: Database["public"]["Enums"]["service_type"][]
          updated_at?: string
          user_id?: string | null
          verification_requested?: boolean
          verified?: boolean
          whatsapp?: string | null
        }
        Relationships: []
      }
      phone_corrections: {
        Row: {
          contact_label: string
          created_at: string
          current_number: string
          id: string
          notes: string | null
          reviewed_at: string | null
          status: string
          submitted_by_name: string | null
          submitted_by_user_id: string | null
          suggested_number: string
        }
        Insert: {
          contact_label: string
          created_at?: string
          current_number: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          status?: string
          submitted_by_name?: string | null
          submitted_by_user_id?: string | null
          suggested_number: string
        }
        Update: {
          contact_label?: string
          created_at?: string
          current_number?: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          status?: string
          submitted_by_name?: string | null
          submitted_by_user_id?: string | null
          suggested_number?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          clerk_user_id: string | null
          created_at: string
          display_name: string
          email: string | null
          id: string
          role: string
        }
        Insert: {
          avatar_url?: string | null
          clerk_user_id?: string | null
          created_at?: string
          display_name: string
          email?: string | null
          id: string
          role?: string
        }
        Update: {
          avatar_url?: string | null
          clerk_user_id?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
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
      fund_leader_balances: {
        Row: {
          address: string | null
          balance: number | null
          contact_email: string | null
          display_name: string | null
          id: string | null
          intended_services: string | null
          island: Database["public"]["Enums"]["island"] | null
          org_name: string | null
          org_verified: boolean | null
          status: string | null
          total_disbursed: number | null
          total_received: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      user_org_ids: { Args: { uid: string }; Returns: string[] }
    }
    Enums: {
      accessible_status: "yes" | "no" | "unsure"
      aid_request_status: "open" | "responding" | "fulfilled" | "unable"
      island: "guam" | "saipan" | "tinian" | "rota"
      offering_status: "active" | "planned" | "closed"
      org_category:
        | "uncategorized"
        | "federal_agency"
        | "national_ngo"
        | "local_government"
        | "local_ngo"
        | "faith_based"
        | "community"
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
      org_category: [
        "uncategorized",
        "federal_agency",
        "national_ngo",
        "local_government",
        "local_ngo",
        "faith_based",
        "community",
      ],
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
