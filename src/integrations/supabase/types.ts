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
      associations: {
        Row: {
          admin_user_id: string | null
          compte_mobile_money: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          nom: string
          numero_registre: string | null
          quartier: string
          representant_nom: string
          representant_telephone: string
          status: string
          total_membres: number
          type: string
          updated_at: string
          ville: string
        }
        Insert: {
          admin_user_id?: string | null
          compte_mobile_money?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          nom: string
          numero_registre?: string | null
          quartier: string
          representant_nom: string
          representant_telephone: string
          status?: string
          total_membres?: number
          type?: string
          updated_at?: string
          ville?: string
        }
        Update: {
          admin_user_id?: string | null
          compte_mobile_money?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          nom?: string
          numero_registre?: string | null
          quartier?: string
          representant_nom?: string
          representant_telephone?: string
          status?: string
          total_membres?: number
          type?: string
          updated_at?: string
          ville?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entite: string
          entite_id: string | null
          id: string
          ip: string | null
          user_id: string | null
          user_label: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entite: string
          entite_id?: string | null
          id?: string
          ip?: string | null
          user_id?: string | null
          user_label?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entite?: string
          entite_id?: string | null
          id?: string
          ip?: string | null
          user_id?: string | null
          user_label?: string | null
        }
        Relationships: []
      }
      ayants_droit: {
        Row: {
          created_at: string
          date_naissance: string | null
          id: string
          lien: string
          membre_id: string
          niveau: string
          nom: string
          prenom: string
          telephone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_naissance?: string | null
          id?: string
          lien: string
          membre_id: string
          niveau?: string
          nom: string
          prenom: string
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_naissance?: string | null
          id?: string
          lien?: string
          membre_id?: string
          niveau?: string
          nom?: string
          prenom?: string
          telephone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ayants_droit_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiaires: {
        Row: {
          compte_mobile_money: string | null
          created_at: string
          id: string
          lien: string
          membre_id: string
          nom: string
          prenom: string
          quote_part: number
          telephone: string
          updated_at: string
        }
        Insert: {
          compte_mobile_money?: string | null
          created_at?: string
          id?: string
          lien: string
          membre_id: string
          nom: string
          prenom: string
          quote_part?: number
          telephone: string
          updated_at?: string
        }
        Update: {
          compte_mobile_money?: string | null
          created_at?: string
          id?: string
          lien?: string
          membre_id?: string
          nom?: string
          prenom?: string
          quote_part?: number
          telephone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaires_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string | null
          id: string
          message: string
          nom: string
          status: string
          sujet: string
          telephone: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          message: string
          nom: string
          status?: string
          sujet: string
          telephone: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          nom?: string
          status?: string
          sujet?: string
          telephone?: string
        }
        Relationships: []
      }
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
          adresse_complete: string | null
          association: string | null
          association_id: string | null
          cni: string | null
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
          adresse_complete?: string | null
          association?: string | null
          association_id?: string | null
          cni?: string | null
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
          adresse_complete?: string | null
          association?: string | null
          association_id?: string | null
          cni?: string | null
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
        Relationships: [
          {
            foreignKeyName: "membres_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          lien: string | null
          lu: boolean
          message: string
          titre: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lien?: string | null
          lu?: boolean
          message: string
          titre: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lien?: string | null
          lu?: boolean
          message?: string
          titre?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      nsia_sync: {
        Row: {
          created_at: string
          dossier_id: string | null
          id: string
          membre_id: string | null
          message: string | null
          payload: Json | null
          response: Json | null
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          dossier_id?: string | null
          id?: string
          membre_id?: string | null
          message?: string | null
          payload?: Json | null
          response?: Json | null
          status?: string
          type: string
        }
        Update: {
          created_at?: string
          dossier_id?: string | null
          id?: string
          membre_id?: string | null
          message?: string | null
          payload?: Json | null
          response?: Json | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "nsia_sync_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nsia_sync_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
        ]
      }
      paiements_assistance: {
        Row: {
          beneficiaire_nom: string | null
          compte_destination: string | null
          created_at: string
          created_by: string | null
          date_paiement: string
          dossier_id: string
          id: string
          montant: number
          notes: string | null
          reference: string | null
          type: string
        }
        Insert: {
          beneficiaire_nom?: string | null
          compte_destination?: string | null
          created_at?: string
          created_by?: string | null
          date_paiement?: string
          dossier_id: string
          id?: string
          montant: number
          notes?: string | null
          reference?: string | null
          type: string
        }
        Update: {
          beneficiaire_nom?: string | null
          compte_destination?: string | null
          created_at?: string
          created_by?: string | null
          date_paiement?: string
          dossier_id?: string
          id?: string
          montant?: number
          notes?: string | null
          reference?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "paiements_assistance_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      parametres: {
        Row: {
          cle: string
          description: string | null
          updated_at: string
          updated_by: string | null
          valeur: Json
        }
        Insert: {
          cle: string
          description?: string | null
          updated_at?: string
          updated_by?: string | null
          valeur: Json
        }
        Update: {
          cle?: string
          description?: string | null
          updated_at?: string
          updated_by?: string | null
          valeur?: Json
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
      stats_admin: { Args: never; Returns: Json }
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
      app_role:
        | "admin"
        | "delegue"
        | "membre"
        | "super_admin"
        | "association"
        | "nsia"
        | "equipe"
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
      app_role: [
        "admin",
        "delegue",
        "membre",
        "super_admin",
        "association",
        "nsia",
        "equipe",
      ],
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
