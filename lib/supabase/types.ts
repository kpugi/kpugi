export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          clerk_id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'advertiser' | 'creator' | 'both';
          phone: string | null;
          paystack_customer_code: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}
