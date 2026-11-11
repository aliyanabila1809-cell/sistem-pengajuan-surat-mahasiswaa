
import { createClient } from
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Ganti dengan Project URL milik kamu
const SUPABASE_URL = "https://ggbilqbxsimpimnlwzlv.supabase.co";

// Ganti dengan Publishable key milik kamu
const SUPABASE_ANON_KEY = "sb_publishable_QOHShkgNDXhpl-aJAwsNiQ_9o7JQnM3";

// Membuat koneksi Supabase
export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
