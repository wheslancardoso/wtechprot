UPDATE orders SET custody_signed_at = NULL, custody_photos = '[]'::jsonb WHERE display_id = 9999;
