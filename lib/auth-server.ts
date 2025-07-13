// lib/auth-server.ts
'use server'; // ← Garante Server Component (necessário)

// ✅ CORRETO: só usar esse arquivo dentro de componentes em /app (App Router)

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export function createSupabaseServerClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies,
    }
  );
}
