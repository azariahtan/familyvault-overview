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
      app_settings: {
        Row: {
          alert_review_days: number
          alert_urgent_days: number
          currency: string
          family_name: string
          id: number
          simulated_date: string | null
          updated_at: string
        }
        Insert: {
          alert_review_days?: number
          alert_urgent_days?: number
          currency?: string
          family_name?: string
          id?: number
          simulated_date?: string | null
          updated_at?: string
        }
        Update: {
          alert_review_days?: number
          alert_urgent_days?: number
          currency?: string
          family_name?: string
          id?: number
          simulated_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      gobag_items: {
        Row: {
          checked: boolean
          id: string
          label: string
          sort_order: number
        }
        Insert: {
          checked?: boolean
          id?: string
          label: string
          sort_order?: number
        }
        Update: {
          checked?: boolean
          id?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      health_conditions: {
        Row: {
          actions: Json
          created_at: string
          details: string | null
          id: string
          is_demo: boolean
          member_id: string
          name: string
          notes: string | null
          status: Database["public"]["Enums"]["record_status"]
          supplements: Json
          updated_at: string
        }
        Insert: {
          actions?: Json
          created_at?: string
          details?: string | null
          id?: string
          is_demo?: boolean
          member_id: string
          name: string
          notes?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          supplements?: Json
          updated_at?: string
        }
        Update: {
          actions?: Json
          created_at?: string
          details?: string | null
          id?: string
          is_demo?: boolean
          member_id?: string
          name?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          supplements?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_conditions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_policies: {
        Row: {
          action: string | null
          category: string
          created_at: string
          end_date: string | null
          expected_payout: number | null
          frequency: string | null
          id: string
          is_demo: boolean
          member_id: string | null
          name: string
          next_due_date: string | null
          payment_method: string | null
          payout_year: number | null
          policy_number: string | null
          premium: number | null
          provider: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["record_status"]
          sum_assured: number | null
          type: string | null
          updated_at: string
        }
        Insert: {
          action?: string | null
          category: string
          created_at?: string
          end_date?: string | null
          expected_payout?: number | null
          frequency?: string | null
          id?: string
          is_demo?: boolean
          member_id?: string | null
          name: string
          next_due_date?: string | null
          payment_method?: string | null
          payout_year?: number | null
          policy_number?: string | null
          premium?: number | null
          provider?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          sum_assured?: number | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          action?: string | null
          category?: string
          created_at?: string
          end_date?: string | null
          expected_payout?: number | null
          frequency?: string | null
          id?: string
          is_demo?: boolean
          member_id?: string | null
          name?: string
          next_due_date?: string | null
          payment_method?: string | null
          payout_year?: number | null
          policy_number?: string | null
          premium?: number | null
          provider?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          sum_assured?: number | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_policies_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_folders: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
          photo_url: string | null
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          photo_url?: string | null
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          photo_url?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "inventory_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          action: string | null
          category: string | null
          created_at: string
          folder_id: string
          id: string
          name: string
          photo_url: string | null
          updated_at: string
          warranty_date: string | null
        }
        Insert: {
          action?: string | null
          category?: string | null
          created_at?: string
          folder_id: string
          id?: string
          name: string
          photo_url?: string | null
          updated_at?: string
          warranty_date?: string | null
        }
        Update: {
          action?: string | null
          category?: string | null
          created_at?: string
          folder_id?: string
          id?: string
          name?: string
          photo_url?: string | null
          updated_at?: string
          warranty_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "inventory_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          cost_basis: number | null
          created_at: string
          current_value: number | null
          group_name: string
          id: string
          is_demo: boolean
          member_id: string | null
          name: string
          projected_return_pct: number | null
          status: Database["public"]["Enums"]["record_status"]
          strategy: string | null
          updated_at: string
        }
        Insert: {
          cost_basis?: number | null
          created_at?: string
          current_value?: number | null
          group_name: string
          id?: string
          is_demo?: boolean
          member_id?: string | null
          name: string
          projected_return_pct?: number | null
          status?: Database["public"]["Enums"]["record_status"]
          strategy?: string | null
          updated_at?: string
        }
        Update: {
          cost_basis?: number | null
          created_at?: string
          current_value?: number | null
          group_name?: string
          id?: string
          is_demo?: boolean
          member_id?: string | null
          name?: string
          projected_return_pct?: number | null
          status?: Database["public"]["Enums"]["record_status"]
          strategy?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_rate_schedule: {
        Row: {
          id: string
          loan_id: string
          rate: number | null
          rate_type: string | null
          sort_order: number
          year_label: string
        }
        Insert: {
          id?: string
          loan_id: string
          rate?: number | null
          rate_type?: string | null
          sort_order?: number
          year_label: string
        }
        Update: {
          id?: string
          loan_id?: string
          rate?: number | null
          rate_type?: string | null
          sort_order?: number
          year_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_rate_schedule_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          action: string | null
          balance: number | null
          bank: string
          created_at: string
          id: string
          is_demo: boolean
          member_id: string | null
          monthly_payment: number | null
          notes: string | null
          original_amount: number | null
          purpose: string | null
          rate: number | null
          rate_label: string | null
          reprice_date: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["record_status"]
          term_years: number | null
          updated_at: string
        }
        Insert: {
          action?: string | null
          balance?: number | null
          bank: string
          created_at?: string
          id?: string
          is_demo?: boolean
          member_id?: string | null
          monthly_payment?: number | null
          notes?: string | null
          original_amount?: number | null
          purpose?: string | null
          rate?: number | null
          rate_label?: string | null
          reprice_date?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          term_years?: number | null
          updated_at?: string
        }
        Update: {
          action?: string | null
          balance?: number | null
          bank?: string
          created_at?: string
          id?: string
          is_demo?: boolean
          member_id?: string | null
          monthly_payment?: number | null
          notes?: string | null
          original_amount?: number | null
          purpose?: string | null
          rate?: number | null
          rate_label?: string | null
          reprice_date?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          term_years?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          short_name: string | null
          sort_order: number
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          name: string
          short_name?: string | null
          sort_order?: number
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          short_name?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      properties: {
        Row: {
          created_at: string
          currency: string
          current_value: number | null
          fixed_rate_end: string | null
          id: string
          interest_rate: number | null
          is_demo: boolean
          joint_member_ids: string[] | null
          market_rent: number | null
          member_id: string | null
          monthly_costs: number | null
          monthly_payment: number | null
          monthly_rent: number | null
          mortgage_balance: number | null
          mortgage_bank: string | null
          name: string
          purchase_price: number | null
          purpose: Database["public"]["Enums"]["property_purpose"]
          status: Database["public"]["Enums"]["record_status"]
          strategy: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          current_value?: number | null
          fixed_rate_end?: string | null
          id?: string
          interest_rate?: number | null
          is_demo?: boolean
          joint_member_ids?: string[] | null
          market_rent?: number | null
          member_id?: string | null
          monthly_costs?: number | null
          monthly_payment?: number | null
          monthly_rent?: number | null
          mortgage_balance?: number | null
          mortgage_bank?: string | null
          name: string
          purchase_price?: number | null
          purpose?: Database["public"]["Enums"]["property_purpose"]
          status?: Database["public"]["Enums"]["record_status"]
          strategy?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          current_value?: number | null
          fixed_rate_end?: string | null
          id?: string
          interest_rate?: number | null
          is_demo?: boolean
          joint_member_ids?: string[] | null
          market_rent?: number | null
          member_id?: string | null
          monthly_costs?: number | null
          monthly_payment?: number | null
          monthly_rent?: number | null
          mortgage_balance?: number | null
          mortgage_bank?: string | null
          name?: string
          purchase_price?: number | null
          purpose?: Database["public"]["Enums"]["property_purpose"]
          status?: Database["public"]["Enums"]["record_status"]
          strategy?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      property_rate_schedule: {
        Row: {
          id: string
          property_id: string
          rate: number | null
          rate_type: string | null
          sort_order: number
          year_label: string
        }
        Insert: {
          id?: string
          property_id: string
          rate?: number | null
          rate_type?: string | null
          sort_order?: number
          year_label: string
        }
        Update: {
          id?: string
          property_id?: string
          rate?: number | null
          rate_type?: string | null
          sort_order?: number
          year_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_rate_schedule_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      record_documents: {
        Row: {
          bucket: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["entity_type"]
          id: string
          label: string | null
          path: string
          reminder_date: string | null
          uploaded_at: string
        }
        Insert: {
          bucket?: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["entity_type"]
          id?: string
          label?: string | null
          path: string
          reminder_date?: string | null
          uploaded_at?: string
        }
        Update: {
          bucket?: string
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["entity_type"]
          id?: string
          label?: string | null
          path?: string
          reminder_date?: string | null
          uploaded_at?: string
        }
        Relationships: []
      }
      record_history: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["entity_type"]
          id: string
          note: string
          occurred_on: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["entity_type"]
          id?: string
          note: string
          occurred_on?: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["entity_type"]
          id?: string
          note?: string
          occurred_on?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          done: boolean
          entity_id: string
          entity_type: string
          id: string
          note: string | null
          remind_at: string
          repeat: string | null
          what: string
          who: string | null
        }
        Insert: {
          created_at?: string
          done?: boolean
          entity_id: string
          entity_type: string
          id?: string
          note?: string | null
          remind_at: string
          repeat?: string | null
          what: string
          who?: string | null
        }
        Update: {
          created_at?: string
          done?: boolean
          entity_id?: string
          entity_type?: string
          id?: string
          note?: string | null
          remind_at?: string
          repeat?: string | null
          what?: string
          who?: string | null
        }
        Relationships: []
      }
      savings_accounts: {
        Row: {
          account_number: string | null
          account_type: string | null
          balance: number | null
          created_at: string
          group_name: string
          id: string
          institution: string
          interest_rate: number | null
          is_demo: boolean
          last_updated: string | null
          maturity_date: string | null
          member_id: string | null
          note: string | null
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
        }
        Insert: {
          account_number?: string | null
          account_type?: string | null
          balance?: number | null
          created_at?: string
          group_name: string
          id?: string
          institution: string
          interest_rate?: number | null
          is_demo?: boolean
          last_updated?: string | null
          maturity_date?: string | null
          member_id?: string | null
          note?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Update: {
          account_number?: string | null
          account_type?: string | null
          balance?: number | null
          created_at?: string
          group_name?: string
          id?: string
          institution?: string
          interest_rate?: number | null
          is_demo?: boolean
          last_updated?: string | null
          maturity_date?: string | null
          member_id?: string | null
          note?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_accounts_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
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
      entity_type:
        | "property"
        | "loan"
        | "insurance"
        | "investment"
        | "savings"
        | "health"
        | "inventory"
      property_purpose: "capital_growth" | "rental_yield" | "own_home" | "other"
      record_status: "urgent" | "review" | "settled"
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
      entity_type: [
        "property",
        "loan",
        "insurance",
        "investment",
        "savings",
        "health",
        "inventory",
      ],
      property_purpose: ["capital_growth", "rental_yield", "own_home", "other"],
      record_status: ["urgent", "review", "settled"],
    },
  },
} as const
