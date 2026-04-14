# Skill: deploy-sinlaku

Deploy or redeploy the emergency-sinlaku app to Nexlayer.

## Usage

```
/deploy-sinlaku              # deploy production
/deploy-sinlaku dev          # deploy dev environment
/deploy-sinlaku status       # check deployment status
/deploy-sinlaku logs         # tail deployment logs
/deploy-sinlaku debug        # open debug session
```

## Context

- **Code path:** `/Users/jay/Home/projects/active/directory-gu/hosted/sinlaku`
- **Prod YAML:** `nexlayer.yaml` → app `emergency-sinlaku` → `sinlaku.directory.gu`
- **Dev YAML:** `nexlayer.dev.yaml` → app `emergency-sinlaku-dev` → `TEST-sinlaku.directory.gu`
- **Prod image:** `gitea.elizaga.dev/directory-gu/emergency-sinlaku:latest`
- **Dev image:** `gitea.elizaga.dev/jay-elizaga-dev-gitea/directory-gu:latest`
- **MCP tools:** `mcp__nexlayer-mcp__*` (available in this session)

---

## Decision Tree

```
/deploy-sinlaku [env]
    ├── env = prod (default)
    │     → Read nexlayer.yaml
    │     → nexlayer_validate_yaml
    │     → nexlayer_deploy  ← liveness confirmed in response (HTTP 200)
    │     → Report live URL: sinlaku.directory.gu
    │     → NOTE: nexlayer_check_deployment_status returns "No environment found"
    │             for custom-domain apps — trust the deploy response liveness instead
    │
    ├── env = dev
    │     → Read nexlayer.dev.yaml
    │     → nexlayer_validate_yaml
    │     → nexlayer_deploy
    │     → nexlayer_check_deployment_status (applicationName: emergency-sinlaku-dev)
    │     → Report live URL: amiable-beetle-emergency-sinlaku-dev.cluster-se1-us.nexlayer.ai
    │
    ├── status
    │     → nexlayer_check_deployment_status (applicationName: emergency-sinlaku)
    │     → Report pod health summary
    │
    ├── logs
    │     → nexlayer_get_deployment_logs (applicationName: emergency-sinlaku)
    │
    └── debug
          → Ask which env (prod/dev)
          → nexlayer_debug_deploy_proxy (applicationName: emergency-sinlaku[-dev])
          → nexlayer_debug_namespace_info
          → Present findings, offer: shell / file edit / pod restart / db query
```

---

## Deploy Steps (Production)

> **Registry rule:** Always deploy from `registry.nexlayer.io/nexlayer-mcp/emergency-sinlaku:<SHA>`.
> Nexlayer cannot pull from the private Gitea registry (`gitea.elizaga.dev`) — pods won't
> restart and the old image keeps serving. Push to Gitea first (source of truth), then
> mirror to the Nexlayer registry for the actual deploy.

1. **Get git SHA:**
   ```bash
   cd /Users/jay/Home/projects/active/directory-gu/hosted/sinlaku
   SHA=$(git rev-parse --short HEAD)
   echo $SHA
   ```

2. **Build image:**
   ```bash
   podman build --platform linux/amd64 \
     -t gitea.elizaga.dev/directory-gu/emergency-sinlaku:$SHA \
     -t gitea.elizaga.dev/directory-gu/emergency-sinlaku:latest \
     -f Containerfile .
   ```

3. **Push to Gitea (source of truth):**
   ```bash
   podman push gitea.elizaga.dev/directory-gu/emergency-sinlaku:$SHA
   podman push gitea.elizaga.dev/directory-gu/emergency-sinlaku:latest
   ```

4. **Mirror to Nexlayer registry and push:**
   ```bash
   podman login registry.nexlayer.io -u nexlayer-mcp-user -p NexlayerUser01
   podman tag gitea.elizaga.dev/directory-gu/emergency-sinlaku:$SHA \
     registry.nexlayer.io/nexlayer-mcp/emergency-sinlaku:$SHA
   podman push registry.nexlayer.io/nexlayer-mcp/emergency-sinlaku:$SHA
   ```

5. **Deploy** from Nexlayer registry (no `registryLogin` block needed):
   ```yaml
   image: registry.nexlayer.io/nexlayer-mcp/emergency-sinlaku:<SHA>
   ```
   Use `nexlayer_deploy` with the YAML — no `registryLogin` block.

6. **Confirm liveness:**
   A slow liveness check (5-10s) means the pod actually restarted with the new image. ✓
   A fast check (< 200ms) means the old container is still serving — image pull likely failed.

   > **Known quirk:** `nexlayer_check_deployment_status` returns "No environment found"
   > for custom-domain apps. Trust the deploy response liveness time instead.

7. **Verify:**
   ```bash
   curl -s https://sinlaku.directory.gu/ | grep -o 'assets/index-[^"]*'
   # Should match the bundle hash from the vite build output
   ```

---

## Deploy Steps (Dev)

Same flow but:
- Gitea image: `gitea.elizaga.dev/directory-gu/emergency-sinlaku:$SHA`
- Nexlayer image: `registry.nexlayer.io/nexlayer-mcp/emergency-sinlaku-dev:$SHA`
- App name: `emergency-sinlaku-dev`
- No `url:` field (or `url: TEST-sinlaku.directory.gu`)
- Supabase: `hguhmgudjmqyiashftzk` (dev project)

---

## Image Build (if needed)

If the user wants to rebuild and push the image before deploying:

```bash
# Run inside a podman container — NOT host node
cd /Users/jay/Home/projects/active/directory-gu/hosted/sinlaku

# Build for linux/amd64 (required by Nexlayer)
podman build --platform linux/amd64 \
  -t gitea.elizaga.dev/directory-gu/emergency-sinlaku:latest .

# Push
podman push gitea.elizaga.dev/directory-gu/emergency-sinlaku:latest
```

**Note:** Always build for `linux/amd64`. ARM builds will fail on Nexlayer.

---

## Debug Session Workflow

When called with `debug`:

1. Ask: prod or dev?
2. `nexlayer_debug_deploy_proxy { domain: "amiable-beetle-emergency-sinlaku[.cluster-se1-us.nexlayer.ai]", applicationName: "emergency-sinlaku[-dev]" }`
3. `nexlayer_debug_namespace_info` — get pod names + statuses
4. Based on symptom:
   - Crash → `pod_describe` → `shell_open` → check logs
   - Config wrong → `file_copy_from /app/config.js` → `file_edit` → `pod_restart`
   - Network → `proxy_http` → `namespace_dns`
5. When done: `nexlayer_debug_destroy_proxy` (or leave; auto-scales to 0 in 10 min)

---

## Common Issues

| Symptom | Fix |
|---|---|
| `No environment found` after deploy | Known quirk for custom-domain apps — deploy response liveness is authoritative; ignore this error if deploy returned HTTP 200 |
| `No environment found` before any deploy | App not deployed — run deploy first |
| Image pull error | Check registry login in YAML; re-push image |
| Pod CrashLoopBackOff | Check logs via `nexlayer_get_deployment_logs` |
| Supabase 401 | Env var mismatch — check `VITE_SUPABASE_PUBLISHABLE_KEY` in YAML |
| Domain not working | `nexlayer_check_domain_configuration { domain: "sinlaku.directory.gu" }` |

---

## Reference

- **Full deployment plan:** `plans/nexlayer-deployment.md` (this project)
- **DNS setup:** `plans/dns-deployment-setup.md`
- **Nexlayer ship-it skill:** `nexlayer_get_skill_content { skillName: "ship-it-nexlayer" }`
- **Nexlayer debug skill:** `nexlayer_get_skill_content { skillName: "debug-nexlayer" }`
