# Bigcapital VPS Deployment

This bundle is intended for the current `vultr` host:

- Docker + Docker Compose already installed
- Caddy already owns public `:80/:443`
- Tailscale is enabled with MagicDNS name `vultr.taild355d6.ts.net`

It avoids port conflicts by binding Bigcapital's internal proxy only to
`127.0.0.1:${BIGCAPITAL_PROXY_PORT}`.

## Files

- `docker-compose.vps.yml`: production stack for the VPS
- `.env.example`: required runtime variables

## Recommended first launch

1. Copy `.env.example` to `.env` and fill in secrets.
   For this VPS bundle, set `SYSTEM_DB_USER` and `TENANT_DB_USER` to `root`,
   and set both matching passwords to `DB_ROOT_PASSWORD`. Bigcapital creates
   per-tenant databases at runtime, so the restricted app user is not enough
   on a stock MariaDB container.
2. Set `BASE_URL` to the exact URL you will open in the browser.
   If Tailscale HTTPS is healthy, use `https://vultr.taild355d6.ts.net`.
   If Tailscale certificate provisioning is broken, use the HTTP tailnet URL instead.
3. Leave `PLAID_LINK_WEBHOOK` empty for the first pass.
4. Run migrations once:

```sh
docker compose --env-file .env -f docker-compose.vps.yml --profile tools run --rm migrate
```

5. Start the app:

```sh
docker compose --env-file .env -f docker-compose.vps.yml up -d
```

6. Expose it privately over Tailscale HTTPS if your tailnet can issue a cert:

```sh
tailscale serve --bg 443 http://127.0.0.1:${BIGCAPITAL_PROXY_PORT}
```

7. Open:

```text
https://vultr.taild355d6.ts.net
```

If `tailscale cert` or HTTPS serve fails, fall back to private HTTP and align
`BASE_URL` with it:

```sh
tailscale serve --https=443 off
tailscale serve --http=80 --bg http://127.0.0.1:${BIGCAPITAL_PROXY_PORT}
```

Then open:

```text
http://vultr.taild355d6.ts.net
```

## Public hostname option

If you want Plaid webhooks to work automatically, switch from the Tailscale-only
URL to a public HTTPS hostname and point Caddy at `127.0.0.1:${BIGCAPITAL_PROXY_PORT}`.

Then update:

- `BASE_URL=https://your-public-hostname`
- `PLAID_LINK_WEBHOOK=https://your-public-hostname/api/banking/plaid/webhooks`

Plaid initial linking is not blocked by leaving the webhook blank, because this
app exchanges the `public_token` from the frontend and immediately creates the
Plaid item server-side. Automatic transaction update webhooks do require a
public HTTPS endpoint.
