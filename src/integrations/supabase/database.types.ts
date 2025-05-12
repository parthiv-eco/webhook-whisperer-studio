
// Custom declaration file for Supabase tables
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          color?: string | null;
          created_at?: string;
        };
      };
      webhooks: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          url: string;
          method: string;
          headers: string;
          default_payload: string;
          example_payloads: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          url: string;
          method: string;
          headers?: string;
          default_payload?: string;
          example_payloads?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          description?: string | null;
          url?: string;
          method?: string;
          headers?: string;
          default_payload?: string;
          example_payloads?: string;
          created_at?: string;
        };
      };
      webhook_responses: {
        Row: {
          id: string;
          webhook_id: string;
          status: number;
          status_text: string;
          headers: Record<string, any>;
          data: Record<string, any> | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          webhook_id: string;
          status: number;
          status_text: string;
          headers: Record<string, any>;
          data?: Record<string, any> | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          webhook_id?: string;
          status?: number;
          status_text?: string;
          headers?: Record<string, any>;
          data?: Record<string, any> | null;
          timestamp?: string;
        };
      };
      demo_credentials: {
        Row: {
          id: string;
          email: string;
          password: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
