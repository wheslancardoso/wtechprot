
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

    console.log('Querying auth.users...');
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error fetching users:', error);
        return;
    }

    // Sort by last_sign_in_at
    const sortedUsers = users.sort((a, b) => {
        return new Date(b.last_sign_in_at) - new Date(a.last_sign_in_at);
    });

    if (sortedUsers.length > 0) {
        const lastUser = sortedUsers[0];
        console.log('Last signed in user:', {
            email: lastUser.email,
            last_sign_in_at: lastUser.last_sign_in_at
        });

        // Check matching tenant
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .select('*')
            .eq('email', lastUser.email)
            .single();

        if (tenantError) {
            console.log('No tenant found for this user email.');
        } else {
            console.log('Matching tenant found:', tenant.trade_name);
        }

    } else {
        console.log('No users found.');
    }
}

main();
