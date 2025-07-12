// Diretório: lib/supabaseServerComponent.ts
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { type Database } from '@/types/supabase'; // se você tiver o tipo gerado pelo Supabase

export const supabaseServer = () =>
  createServerComponentClient<Database>({ cookies });
