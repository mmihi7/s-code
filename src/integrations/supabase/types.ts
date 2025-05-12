export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      pending_entries: {
        Row: {
          authenticated: boolean | null
          denial_reason: string | null
          deny_reason: string | null
          department: string | null
          email: string | null
          id: string
          idnumber: string | null
          message: string | null
          name: string | null
          phone: string | null
          premise_id: string | null
          processed_at: string | null
          purpose: string | null
          signature: string | null
          status: string | null
          submitted_at: string | null
          user_id: string | null
          vehicle: string | null
          visitingperson: string | null
        }
        Insert: {
          authenticated?: boolean | null
          denial_reason?: string | null
          deny_reason?: string | null
          department?: string | null
          email?: string | null
          id?: string
          idnumber?: string | null
          message?: string | null
          name?: string | null
          phone?: string | null
          premise_id?: string | null
          processed_at?: string | null
          purpose?: string | null
          signature?: string | null
          status?: string | null
          submitted_at?: string | null
          user_id?: string | null
          vehicle?: string | null
          visitingperson?: string | null
        }
        Update: {
          authenticated?: boolean | null
          denial_reason?: string | null
          deny_reason?: string | null
          department?: string | null
          email?: string | null
          id?: string
          idnumber?: string | null
          message?: string | null
          name?: string | null
          phone?: string | null
          premise_id?: string | null
          processed_at?: string | null
          purpose?: string | null
          signature?: string | null
          status?: string | null
          submitted_at?: string | null
          user_id?: string | null
          vehicle?: string | null
          visitingperson?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_entries_premise_id_fkey"
            columns: ["premise_id"]
            isOneToOne: false
            referencedRelation: "premises"
            referencedColumns: ["id"]
          },
        ]
      }
      premises: {
        Row: {
          address: string
          admin_name: string
          approval_flow: string | null
          business_type: string
          created_at: string | null
          email: string
          exit_tracking: boolean
          id: string
          multiple_entries: boolean
          name: string
          notifications: boolean
          owner_id: string | null
          phone: string
          sms_notifications: boolean
          ussd: boolean
          visitor_fields: Json | null
        }
        Insert: {
          address: string
          admin_name: string
          approval_flow?: string | null
          business_type: string
          created_at?: string | null
          email: string
          exit_tracking?: boolean
          id: string
          multiple_entries?: boolean
          name: string
          notifications?: boolean
          owner_id?: string | null
          phone: string
          sms_notifications?: boolean
          ussd?: boolean
          visitor_fields?: Json | null
        }
        Update: {
          address?: string
          admin_name?: string
          approval_flow?: string | null
          business_type?: string
          created_at?: string | null
          email?: string
          exit_tracking?: boolean
          id?: string
          multiple_entries?: boolean
          name?: string
          notifications?: boolean
          owner_id?: string | null
          phone?: string
          sms_notifications?: boolean
          ussd?: boolean
          visitor_fields?: Json | null
        }
        Relationships: []
      }
      qrcode_forms: {
        Row: {
          created_at: string | null
          form_fields: Json | null
          generated_at: string | null
          id: number
          iteration: number
          premise_id: string
          qrcode_url: string | null
        }
        Insert: {
          created_at?: string | null
          form_fields?: Json | null
          generated_at?: string | null
          id?: number
          iteration?: number
          premise_id: string
          qrcode_url?: string | null
        }
        Update: {
          created_at?: string | null
          form_fields?: Json | null
          generated_at?: string | null
          id?: number
          iteration?: number
          premise_id?: string
          qrcode_url?: string | null
        }
        Relationships: []
      }
      registered_users: {
        Row: {
          auth_user_id: string | null
          checked_in_at: string | null
          created_at: string | null
          email: string | null
          facephoto: string | null
          id: string
          idnumber: string | null
          idphoto_back: string | null
          idphoto_front: string | null
          name: string | null
          phone: string | null
          registered_at: string
          role: string | null
          signature: string | null
          verified: boolean | null
        }
        Insert: {
          auth_user_id?: string | null
          checked_in_at?: string | null
          created_at?: string | null
          email?: string | null
          facephoto?: string | null
          id?: string
          idnumber?: string | null
          idphoto_back?: string | null
          idphoto_front?: string | null
          name?: string | null
          phone?: string | null
          registered_at?: string
          role?: string | null
          signature?: string | null
          verified?: boolean | null
        }
        Update: {
          auth_user_id?: string | null
          checked_in_at?: string | null
          created_at?: string | null
          email?: string | null
          facephoto?: string | null
          id?: string
          idnumber?: string | null
          idphoto_back?: string | null
          idphoto_front?: string | null
          name?: string | null
          phone?: string | null
          registered_at?: string
          role?: string | null
          signature?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      visitors: {
        Row: {
          auth_user_id: string | null
          authenticated: boolean | null
          checked_in_at: string | null
          checked_out_at: string | null
          checkout_reason: string | null
          created_at: string | null
          denial_reason: string | null
          denied_at: string | null
          department: string | null
          email: string | null
          entry_approved_at: string | null
          exit_recorded: boolean | null
          facephoto: string | null
          id: string
          idnumber: string | null
          idphoto_back: string | null
          idphoto_front: string | null
          name: string | null
          phone: string | null
          premise_id: string | null
          purpose: string | null
          signature: string | null
          status: string | null
          user_id: string | null
          vehicle: string | null
          visit_duration: number | null
          visitingperson: string | null
          visitor_data: Json | null
        }
        Insert: {
          auth_user_id?: string | null
          authenticated?: boolean | null
          checked_in_at?: string | null
          checked_out_at?: string | null
          checkout_reason?: string | null
          created_at?: string | null
          denial_reason?: string | null
          denied_at?: string | null
          department?: string | null
          email?: string | null
          entry_approved_at?: string | null
          exit_recorded?: boolean | null
          facephoto?: string | null
          id?: string
          idnumber?: string | null
          idphoto_back?: string | null
          idphoto_front?: string | null
          name?: string | null
          phone?: string | null
          premise_id?: string | null
          purpose?: string | null
          signature?: string | null
          status?: string | null
          user_id?: string | null
          vehicle?: string | null
          visit_duration?: number | null
          visitingperson?: string | null
          visitor_data?: Json | null
        }
        Update: {
          auth_user_id?: string | null
          authenticated?: boolean | null
          checked_in_at?: string | null
          checked_out_at?: string | null
          checkout_reason?: string | null
          created_at?: string | null
          denial_reason?: string | null
          denied_at?: string | null
          department?: string | null
          email?: string | null
          entry_approved_at?: string | null
          exit_recorded?: boolean | null
          facephoto?: string | null
          id?: string
          idnumber?: string | null
          idphoto_back?: string | null
          idphoto_front?: string | null
          name?: string | null
          phone?: string | null
          premise_id?: string | null
          purpose?: string | null
          signature?: string | null
          status?: string | null
          user_id?: string | null
          vehicle?: string | null
          visit_duration?: number | null
          visitingperson?: string | null
          visitor_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "users_premise_id_fkey"
            columns: ["premise_id"]
            isOneToOne: false
            referencedRelation: "premises"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
