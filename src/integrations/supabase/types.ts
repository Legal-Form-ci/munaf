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
      cotisations: {
        Row: {
          created_at: string
          date_paiement: string | null
          enregistre_par: string | null
          id: string
          membre_id: string
          mois: string
          montant: number
          moyen: string | null
          reference: string | null
          status: Database["public"]["Enums"]["cotisation_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_paiement?: string | null
          enregistre_par?: string | null
          id?: string
          membre_id: string
          mois: string
          montant: number
          moyen?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["cotisation_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_paiement?: string | null
          enregistre_par?: string | null
          id?: string
          membre_id?: string
          mois?: string
          montant?: number
          moyen?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["cotisation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cotisations_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
        ]
      }
      dossier_documents: {
        Row: {
          created_at: string
          dossier_id: string
          id: string
          storage_path: string
          type: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          dossier_id: string
          id?: string
          storage_path: string
          type: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          dossier_id?: string
          id?: string
          storage_path?: string
          type?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dossier_documents_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      dossiers: {
        Row: {
          cause: string | null
          created_at: string
          date_deces: string
          date_versement: string | null
          declarant_lien: string | null
          declarant_nom: string
          declarant_telephone: string
          delegue_id: string | null
          id: string
          lieu_deces: string | null
          membre_id: string
          montant_assistance: number | null
          notes: string | null
          numero: string
          reference_versement: string | null
          status: Database["public"]["Enums"]["dossier_status"]
          traite_par: string | null
          updated_at: string
        }
        Insert: {
          cause?: string | null
          created_at?: string
          date_deces: string
          date_versement?: string | null
          declarant_lien?: string | null
          declarant_nom: string
          declarant_telephone: string
          delegue_id?: string | null
          id?: string
          lieu_deces?: string | null
          membre_id: string
          montant_assistance?: number | null
          notes?: string | null
          numero: string
          reference_versement?: string | null
          status?: Database["public"]["Enums"]["dossier_status"]
          traite_par?: string | null
          updated_at?: string
        }
        Update: {
          cause?: string | null
          created_at?: string
          date_deces?: string
          date_versement?: string | null
          declarant_lien?: string | null
          declarant_nom?: string
          declarant_telephone?: string
          delegue_id?: string | null
          id?: string
          lieu_deces?: string | null
          membre_id?: string
          montant_assistance?: number | null
          notes?: string | null
          numero?: string
          reference_versement?: string | null
          status?: Database["public"]["Enums"]["dossier_status"]
          traite_par?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dossiers_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
        ]
      }
      membres: {
        Row: {
          association: string | null
          created_at: string
          date_adhesion: string
          date_deces: string | null
          date_naissance: string | null
          delegue_id: string | null
          email: string | null
          fin_carence: string | null
          formule: Database["public"]["Enums"]["formule"]
          id: string
          matricule: string
          nom: string
          photo_url: string | null
          prenom: string
          profession: string | null
          quartier: string
          region: string
          sexe: string
          status: Database["public"]["Enums"]["member_status"]
          telephone: string
          updated_at: string
          user_id: string | null
          ville: string
        }
        Insert: {
          association?: string | null
          created_at?: string
          date_adhesion?: string
          date_deces?: string | null
          date_naissance?: string | null
          delegue_id?: string | null
          email?: string | null
          fin_carence?: string | null
          formule?: Database["public"]["Enums"]["formule"]
          id?: string
          matricule: string
          nom: string
          photo_url?: string | null
          prenom: string
          profession?: string | null
          quartier: string
          region?: string
          sexe: string
          status?: Database["public"]["Enums"]["member_status"]
          telephone: string
          updated_at?: string
          user_id?: string | null
          ville?: string
        }
        Update: {
          association?: string | null
          created_at?: string
          date_adhesion?: string
          date_deces?: string | null
          date_naissance?: string | null
          delegue_id?: string | null
          email?: string | null
          fin_carence?: string | null
          formule?: Database["public"]["Enums"]["formule"]
          id?: string
          matricule?: string
          nom?: string
          photo_url?: string | null
          prenom?: string
          profession?: string | null
          quartier?: string
          region?: string
          sexe?: string
          status?: Database["public"]["Enums"]["member_status"]
          telephone?: string
          updated_at?: string
          user_id?: string | null
          ville?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      stats_publiques: {
        Args: never
        Returns: {
          assistance_versee: number
          cotisations_collectees: number
          quartiers: number
          total_dossiers: number
          total_membres: number
        }[]
      }
      verifier_membre: {
        Args: { _query: string }
        Returns: {
          date_adhesion: string
          formule: Database["public"]["Enums"]["formule"]
          matricule: string
          nom: string
          photo_url: string
          prenom: string
          quartier: string
          status: Database["public"]["Enums"]["member_status"]
          ville: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "delegue" | "membre"
      cotisation_status: "payee" | "en_attente" | "en_retard"
      dossier_status:
        | "declare"
        | "verification"
        | "valide"
        | "transmis"
        | "assistance_versee"
        | "cloture"
        | "rejete"
      formule: "F100" | "F200" | "F300" | "F500" | "F1000"
      member_status:
        | "actif"
        | "carence"
        | "suspendu"
        | "expire"
        | "resilie"
        | "decede"
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
      app_role: ["admin", "delegue", "membre"],
      cotisation_status: ["payee", "en_attente", "en_retard"],
      dossier_status: [
        "declare",
        "verification",
        "valide",
        "transmis",
        "assistance_versee",
        "cloture",
        "rejete",
      ],
      formule: ["F100", "F200", "F300", "F500", "F1000"],
      member_status: [
        "actif",
        "carence",
        "suspendu",
        "expire",
        "resilie",
        "decede",
      ],
    },
  },
} as const
