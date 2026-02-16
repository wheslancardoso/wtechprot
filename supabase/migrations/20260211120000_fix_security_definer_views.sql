-- Migration: Fix Security Definer View Vulnerabilities
-- Description: Changes views from SECURITY DEFINER (default or explicit) to SECURITY INVOKER.
-- This ensures that the view executes with the permissions of the user calling it, NOT the view owner.
-- This fixes the security vulnerability where RLS policies were being bypassed.

BEGIN;

  -- 1. v_monthly_metrics
  ALTER VIEW IF EXISTS public.v_monthly_metrics SET (security_invoker = true);

  -- 2. v_current_month_metrics
  ALTER VIEW IF EXISTS public.v_current_month_metrics SET (security_invoker = true);

  -- 3. v_order_timeline
  ALTER VIEW IF EXISTS public.v_order_timeline SET (security_invoker = true);

  -- 4. v_tenant_settings
  ALTER VIEW IF EXISTS public.v_tenant_settings SET (security_invoker = true);

  -- 5. v_public_store_info
  -- NOTE: This view will now return empty results for anonymous users unless
  -- a specific public RLS policy is added to the 'tenant_settings' table.
  ALTER VIEW IF EXISTS public.v_public_store_info SET (security_invoker = true);

COMMIT;
