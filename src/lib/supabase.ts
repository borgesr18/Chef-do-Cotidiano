import { createClient } from '@supabase/supabase-js';
export { recipes, categories, courses, users, analytics, settings, ebooks, ebookPurchases, blogPosts } from './supabase.js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);