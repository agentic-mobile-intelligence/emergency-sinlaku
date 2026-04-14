# directory-gu — Project Context

## CI/CD Infrastructure

**Do not use GitHub Actions.** CI is webhook-driven via ssot-task-invoker → Nate.

| Resource | Value |
|---|---|
| VPS | `158.101.10.97` (Oracle Linux 9.7 x86, Docker CE 29.4.0) |
| Gitea | `https://gitea.elizaga.dev` |
| Registry | `gitea.elizaga.dev/directory-gu/emergency-sinlaku:<SHA>` |
| Deploy target | Nexlayer — `emergency-sinlaku` → `sinlaku.directory.gu` |
| Webhook endpoint | `POST http://localhost:3300/webhook/gitea` (ssot-task-invoker) |

**Full VPS docs:** `/Users/jay/singlesourceoftruth/docs/oracle-vps-instance/README.md`

## Deploy Skill

Use `/deploy-sinlaku` skill for manual deploys — see `.claude/skills/deploy-sinlaku/SKILL.md`.

## CI Workflow (Gitea webhook → ssot-task-invoker → Nate)

```
push to main on gitea.elizaga.dev/directory-gu/emergency-sinlaku
  → Gitea webhook POST http://localhost:3300/webhook/gitea
  → ssot-task-invoker validates HMAC, filters repo+branch
  → submits Nate task (skipPlanner, priority: high)
  → Nate worker: git pull → podman build linux/amd64 → push SHA+latest tags
  → Nate worker: nexlayer_validate_yaml → nexlayer_deploy with SHA-tagged image
  → live at sinlaku.directory.gu
```

**Required env vars on ssot-task-invoker:**
- `GITEA_WEBHOOK_SECRET` — HMAC secret set in Gitea webhook config
- `GITEA_REGISTRY_TOKEN` — Gitea PAT for podman push (in Nate task env)
- `SINLAKU_DIR` — path to sinlaku code (default: `/Users/jay/Home/projects/active/directory-gu/hosted/sinlaku`)

**Image tagging:** Always push with commit SHA tag (`:<sha>`) + `:latest`. Nexlayer deploy uses SHA tag for reproducibility.

## Deployment Quirk

`nexlayer_check_deployment_status` returns "No environment found" for apps with a custom `url:` field.
Trust the liveness check in the `nexlayer_deploy` response instead (HTTP 200 = live).

## Key Paths

| What | Where |
|---|---|
| Code | `/Users/jay/Home/projects/active/directory-gu/hosted/sinlaku` |
| Prod YAML | `sinlaku/nexlayer.yaml` |
| Dev YAML | `sinlaku/nexlayer.dev.yaml` |
| Plans | `plans/` (this project) |
| SSH to VPS | `ssh oci` (alias in `~/.ssh/config`) |
