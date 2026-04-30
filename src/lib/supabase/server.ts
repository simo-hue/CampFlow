import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    // This will cause a runtime error if env vars are missing
    // We log it to help debugging
    logger.error('Supabase Init Error: Missing env variables', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
    });
}

// Server-side client with service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
