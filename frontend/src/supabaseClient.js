import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://calsmekpvsjmnrkshrvz.supabase.co";
const supabaseAnonKey = "sb_publishable_6N0b-4r4xhX9rpYibprvlg_xK7im7du";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
