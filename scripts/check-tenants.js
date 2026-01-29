
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        console.error('Missing Supabase credentials in .env');
        return;
    }

    const supabase = createClient(url, key);

    console.log('Querying tenants...');
    const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error fetching tenants:', error);
    } else {
        console.log('Tenants found:', data);
    }
}

main();
