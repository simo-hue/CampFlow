
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig: Record<string, string> = {};

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            envConfig[match[1]] = match[2];
        }
    });
}

const supabaseUrl = envConfig['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceRoleKey = envConfig['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing env vars:', { hasUrl: !!supabaseUrl, hasKey: !!supabaseServiceRoleKey });
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkGroups() {
    const { data: groups, error } = await supabase
        .from('customer_groups')
        .select('*');

    if (error) {
        console.error('Error fetching groups:', error);
        return;
    }

    console.log('--- Customer Groups in DB ---');
    if (groups.length === 0) {
        console.log('No groups found.');
    } else {
        groups.forEach(g => console.log(`[${g.id}] "${g.name}"`));
    }
    console.log('-----------------------------');
}

checkGroups();
