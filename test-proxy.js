const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPhotos() {
  const { data: order, error } = await supabase
    .from('orders')
    .select('photos_checkin, photos_checkout')
    .not('photos_checkin', 'is', null)
    .limit(1);

  if (order && order.length > 0) {
    if (order[0].photos_checkin && order[0].photos_checkin.length > 0) {
      console.log('Test URL:', order[0].photos_checkin[0]);
    } else {
      console.log('No photos_checkin found');
    }
  } else {
    console.log('No orders with photos_checkin found', error);
  }
}

checkPhotos();
