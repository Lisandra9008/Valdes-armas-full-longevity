// ============================================================
// CONFIGURACIÓN SUPABASE — completar con tus datos del proyecto
// (Supabase → Project Settings → API)
// ============================================================
const SUPABASE_URL = 'https://sslejheogxzzzppyhnwo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_lwUfvDj9sDgEXJFG6UFWWA_WklRnI5D'; // clave pública "anon"

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
