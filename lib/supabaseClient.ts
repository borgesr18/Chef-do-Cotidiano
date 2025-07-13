// lib/supabaseClient.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Esta função já usa automaticamente as variáveis de ambiente:
// NEXT_PUBLIC_SUPABASE_URL
// NEXT_PUBLIC_SUPABASE_ANON_KEY
export const supabase = createClientComponentClient();
