
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
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkSchema() {
    console.log('--- Checking customer_groups ---');
    const { data: groups, error } = await supabase
        .from('customer_groups')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching groups:', error);
    } else if (groups.length > 0) {
        console.log('Columns found:', Object.keys(groups[0]));
        if (!Object.keys(groups[0]).includes('updated_at')) {
            console.error('CRITICAL: updated_at column MISSING in customer_groups');
        } else {
            console.log('updated_at column PRESENT');
        }
    } else {
        console.log('No groups found to check columns. Attempting to insert dummy to fail?');
        // We can't see columns if no rows, but error confirmed it exists.
    }

    console.log('\n--- Checking group_season_configuration (singular) ---');
    const { data: gsc, error: gscError } = await supabase
        .from('group_season_configuration')
        .select('*')
        .limit(1);

    if (gscError) console.log('Singular table fetch error:', gscError.message);
    else console.log('Singular table found.');

    console.log('\n--- Checking group_season_configurations (plural) ---');
    const { data: gscs, error: gscsError } = await supabase
        .from('group_season_configurations')
        .select('*')
        .limit(1);

    if (gscsError) console.log('Plural table fetch error:', gscsError.message);
    else console.log('Plural table found.');
}

checkSchema();
