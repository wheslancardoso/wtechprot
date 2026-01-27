import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wddebrieixjcxurtggmb.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZGVicmllaXhqY3h1cnRnZ21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTM2MDM5NCwiZXhwIjoyMDg0OTM2Mzk0fQ.I9xDkSNBK4vfhCJwN5RLIUZctZ9e2li4lIFwjLpRFks'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
})

async function run() {
    const { data } = await supabase
        .from('orders')
        .select('status, id, customer_id')
        .eq('id', '2963822e-92e4-4141-bb91-18b1230636a2')
        .single()
    console.log('ORDER STATUS:', data)
}
run()
