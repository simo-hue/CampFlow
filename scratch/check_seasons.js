
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://dfoamwkncnwxvzzdjbof.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmb2Ftd2tuY253eHZ6emRqYm9mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc2MTcwOSwiZXhwIjoyMDg0MzM3NzA5fQ._dIGmWrn83WP4IjR7akVeA7MZYBAMat3hS-xaC1p-74";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSeasons() {
    const { data, error } = await supabase
        .from('pricing_seasons')
        .select('*')
        .eq('is_active', true)
        .order('start_date');

    if (error) {
        console.error('Error fetching seasons:', error);
        return;
    }

    console.log('ACTIVE SEASONS:');
    data.forEach(s => {
        console.log(`- ${s.name} (${s.start_date} to ${s.end_date}): Piaz=${s.piazzola_price_per_day}, Pers=${s.person_price_per_day}, Priority=${s.priority}`);
    });
}

checkSeasons();
