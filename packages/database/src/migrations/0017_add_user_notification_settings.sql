-- Migration: add user_notification_settings table
-- Purpose: store per-user email / notification preferences (opt-outs and important defaults)

CREATE TABLE IF NOT EXISTS public.user_notification_settings (
    user_id text PRIMARY KEY REFERENCES public."user"(id) ON DELETE CASCADE,
    email_security boolean NOT NULL DEFAULT true,
    email_account_updates boolean NOT NULL DEFAULT true,
    email_organization boolean NOT NULL DEFAULT true,
    email_apikey boolean NOT NULL DEFAULT true,
    email_marketing boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- (Primary key on user_id already provides an index)

-- Down / cleanup (safe to run multiple times)
-- DROP TABLE IF EXISTS public.user_notification_settings CASCADE;