-- Insert the Foundry Forum OAuth application (idempotent)
-- This ensures the `foundry-forum` client exists for PKCE/public flows used by Discourse.

INSERT INTO "oauth_application" (id, name, client_id, client_secret, redirect_urls, type, disabled, metadata, created_at, updated_at)
SELECT
  'foundry-forum' AS id,
  'Foundry Forum' AS name,
  'foundry-forum' AS client_id,
  NULL AS client_secret,
  '["https://forum.homestead.systems/auth/oidc/callback","https://forum.homestead.systems/auth/oauth2_basic/callback","https://foundry.homestead.systems/auth/oidc/callback"]' AS redirect_urls,
  'user-agent-based' AS type,
  false AS disabled,
  '{"skipConsent": true}'::text AS metadata,
  now() AS created_at,
  now() AS updated_at
WHERE NOT EXISTS (SELECT 1 FROM "oauth_application" WHERE client_id = 'foundry-forum');
