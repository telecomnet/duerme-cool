# Duerme.cool — n8n hardening: remaining steps

Status:
- ✅ DONE & PUBLISHED LIVE: maxTokens=450 (OpenAI Chat Model), maxIterations=5 (AI Agent), 3-product system message.
- ⬜ Pending (below): rate-limit, audio-URL validation, EasyPanel network restriction.
- 🔝 FIRST, do this in the OpenAI dashboard regardless of everything else: set a **hard monthly budget limit** (Settings → Limits → Budget). It's the ultimate backstop against credit drain.

---

## 1. Rate-limit per conversation (extend or add a Code node)

You already have a Code node called **"Verificar duplicado"** (mode: Run Once for All Items). The cleanest place for a throttle is a Code node early in the flow — right after the **Webhook**, before any OpenAI node runs.

Add a new **Code** node named `Rate limit` between `Webhook` and `Bot off/on?` (or append this logic to `Verificar duplicado`). Set mode = **Run Once for All Items** and paste:

```js
// Throttle: max MAX messages per conversation per WINDOW_MS.
// Over-limit messages are dropped (not passed downstream), so no OpenAI cost.
const MAX = 8;            // allowed messages
const WINDOW_MS = 60000;  // per 60 seconds

const store = $getWorkflowStaticData('global');
store.rl = store.rl || {};
const now = Date.now();
const out = [];

for (const item of $input.all()) {
  const b = item.json.body || {};
  const convId = String(b.conversation?.id ?? b.sender?.id ?? 'unknown');
  const recent = (store.rl[convId] || []).filter(t => now - t < WINDOW_MS);
  if (recent.length < MAX) {
    recent.push(now);
    store.rl[convId] = recent;
    out.push(item);          // allowed → continues
  } else {
    store.rl[convId] = recent; // over limit → dropped silently
  }
}
return out;
```

Notes:
- `$getWorkflowStaticData('global')` persists between executions (resets only if n8n restarts — fine for abuse throttling).
- Tune `MAX`/`WINDOW_MS` to your real traffic. 8/min per conversation is generous for a human but kills a flood.
- Wire it: `Webhook → Rate limit → Bot off/on?` (drag the existing Webhook→Bot connection onto the new node).

---

## 2. Validate the audio attachment URL (kills SSRF + huge-file abuse)

The `Descargar audio` node fetches `{{ $("Webhook").item.json.body.attachments[0].data_url }}` — an attacker-controllable URL. Add a guard **before** `Descargar audio` (on the Audio branch of `Switch tipo mensaje`).

Add a **Code** node named `Validar audio URL` (Run Once for All Items) and paste — **replace the host with your real Chatwoot domain**:

```js
const ALLOWED_HOSTS = ['REPLACE_WITH_YOUR_CHATWOOT_DOMAIN']; // e.g. 'chat.duerme.cool'
const out = [];
for (const item of $input.all()) {
  const url = item.json.body?.attachments?.[0]?.data_url || '';
  let host = '';
  try { host = new URL(url).host; } catch (e) {}
  if (!ALLOWED_HOSTS.includes(host)) {
    // Reject anything not served by Chatwoot
    throw new Error('Audio attachment host not allowed: ' + host);
  }
  out.push(item);
}
return out;
```

Wire it: `Switch (Audio) → Validar audio URL → Descargar audio`.

Also on the `Descargar audio` HTTP Request node:
- Options → **Timeout**: set ~15000 ms so a slow/huge fetch can't hang.
- Whisper already rejects files > 25 MB, so the host allowlist + timeout covers the size-abuse case. If you want a hard pre-check, add a HEAD request and reject when `content-length` > 25_000_000.

> Tell me your exact Chatwoot domain and I'll bake it into the snippet.

---

## 3. EasyPanel — restrict who can reach the webhook

Your reply node points at `http://duerme-cool_chatwoot:3000`, so Chatwoot and n8n share the same Docker network. Two layers, easiest first:

### A. (Recommended, simplest, robust) Header Auth on the webhook
1. In the n8n **Webhook** node, set **Authentication = Header Auth**.
2. Create a Header Auth credential with a long random secret (header name e.g. `X-Webhook-Token`, value = a 32+ char random string).
3. In **Chatwoot** (the automation/webhook that calls n8n), add that same header + value to the outgoing request.
4. Now any request without the header gets 401 before any OpenAI node runs.

This alone stops the credit-drain vector even if the URL leaks.

### B. (Optional, defense-in-depth) Traefik IP allow-list in EasyPanel
EasyPanel routes via Traefik. To only accept calls from the Chatwoot container/host:
1. EasyPanel → your **n8n** service → **Advanced / Labels** (custom Traefik labels).
2. Add an `ipAllowList` middleware scoped to the Docker internal subnet (and your own admin IP), then attach it to the n8n router. Exact label syntax depends on your EasyPanel/Traefik version — confirm your Docker network subnet first with `docker network inspect <network>`.
3. Better still: point Chatwoot's webhook at the **internal** n8n hostname (e.g. `http://<n8n-service>:5678/webhook/<path>`) so the call never leaves the Docker network, and keep the public route locked down.

Because a misconfigured Traefik rule can take n8n (and potentially Chatwoot) offline, do step B carefully — ideally test, and keep step A as the primary protection.
