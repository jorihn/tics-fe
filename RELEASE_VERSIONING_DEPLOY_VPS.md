# Release, Versioning, and VPS Deployment Guide

This document defines a practical workflow for releasing this project safely, tracking versions clearly, and deploying to a VPS with Nginx.

---

## 1) Goals

- Keep releases predictable and easy to roll back.
- Keep version numbers meaningful (SemVer).
- Standardize deployment to VPS for all team members.
- Reduce production mistakes with repeatable checklists.

---

## 2) Branching and Environment Model

Recommended model:

- `main`: production-ready code only.
- `develop` (optional): integration branch for upcoming release.
- `feature/*`: feature branches.
- `hotfix/*`: urgent production fixes.

If your team is small, you can use only:

- `main`
- `feature/*`

Rule:

- Never commit directly to `main`.
- Merge to `main` via Pull Request + review.

---

## 3) Versioning Policy (SemVer)

Use format: `MAJOR.MINOR.PATCH`

- `MAJOR` (`1.0.0 -> 2.0.0`): breaking changes.
- `MINOR` (`1.2.0 -> 1.3.0`): backward-compatible new features.
- `PATCH` (`1.2.3 -> 1.2.4`): bugfixes/internal fixes.

### 3.1 Pre-release versions (optional)

For testing/staging:

- `1.4.0-rc.1`
- `1.4.0-beta.2`

Use pre-release tags before final production release.

---

## 4) Commit and PR Conventions

Recommended commit style:

- `feat: add explore plan checkout flow`
- `fix: default carousel focus to standard plan`
- `docs: update deployment guide`
- `chore: bump deps`

PR checklist:

- [ ] Feature works locally
- [ ] `npm run lint` passes
- [ ] Build passes (`npm run build`)
- [ ] No secrets committed
- [ ] Screenshots for UI changes
- [ ] Changelog entry added

---

## 5) Release Workflow

## 5.1 Prepare release

1. Sync latest code:

```bash
git checkout main
git pull origin main
```

2. Ensure quality checks:

```bash
npm ci
npm run lint
npm run build
```

3. Update version in `package.json` (choose one):

```bash
npm version patch
# or
npm version minor
# or
npm version major
```

This creates a commit + git tag automatically.

4. Update changelog (recommended `CHANGELOG.md`) with:

- New features
- Fixes
- Breaking changes

5. Push commit + tags:

```bash
git push origin main
git push origin --tags
```

## 5.2 GitHub Release

In GitHub:

- Open `Releases` -> `Draft a new release`
- Select tag (e.g., `v1.3.0`)
- Paste release notes (copy from changelog)
- Publish release

---

## 6) Rollback Strategy

If production has issues:

1. Identify previous stable tag (e.g., `v1.2.4`).
2. Deploy previous tag on VPS.
3. Restart app process.

Quick rollback commands on VPS:

```bash
cd /root/app/tics-fe
git fetch --tags
git checkout v1.2.4
npm ci
npm run build
pm2 restart tics-fe
```

Then create hotfix branch from the stable tag.

---

## 7) VPS Deployment (Next.js + PM2 + Nginx)

Assumptions:

- App path: `/root/app/tics-fe`
- Domain: `tics.network`
- App runs on port `3000`
- Nginx is installed

## 7.1 Initial server setup

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl nginx
```

Install Node.js LTS (example with nvm):

```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
node -v
npm -v
```

Install PM2:

```bash
npm i -g pm2
```

## 7.2 Clone project

```bash
mkdir -p /root/app
git clone <YOUR_REPO_URL> /root/app/tics-fe
cd /root/app/tics-fe
```

Verify `package.json` exists:

```bash
ls -la
```

## 7.3 Environment variables

Create `.env.production`:

```bash
cp .env.example .env.production
nano .env.production
```

Never commit `.env.production`.

## 7.4 Install and build

```bash
npm ci
npm run build
```

## 7.5 Start with PM2

```bash
pm2 start npm --name tics-fe -- start -- -p 3000
pm2 save
pm2 startup
```

Check status/logs:

```bash
pm2 status
pm2 logs tics-fe --lines 100
```

---

## 8) Nginx Configuration for `tics.network`

Create config:

```bash
sudo nano /etc/nginx/sites-available/tics.network
```

Use:

```nginx
server {
    listen 80;
    server_name tics.network www.tics.network;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable + test:

```bash
sudo ln -s /etc/nginx/sites-available/tics.network /etc/nginx/sites-enabled/tics.network
sudo nginx -t
sudo systemctl reload nginx
```

If default site conflicts:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 9) SSL (Let's Encrypt)

Install certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Issue certificate:

```bash
sudo certbot --nginx -d tics.network -d www.tics.network
```

Test auto-renew:

```bash
sudo certbot renew --dry-run
```

---

## 10) Standard Deployment for New Releases

When a new version is released:

```bash
cd /root/app/tics-fe
git fetch --all --tags
git checkout main
git pull origin main
npm ci
npm run build
pm2 restart tics-fe
```

Health checks:

```bash
pm2 status
curl -I http://127.0.0.1:3000
curl -I https://tics.network
```

---

## 11) Deployment by Tag (Recommended for Production)

For strict reproducibility:

```bash
cd /root/app/tics-fe
git fetch --tags
git checkout v1.3.0
npm ci
npm run build
pm2 restart tics-fe
```

Record deployed version in an ops log (date, tag, operator).

---

## 12) Troubleshooting Quick Notes

### `npm ERR! enoent ... package.json`

You are in the wrong folder or clone is incomplete.

```bash
pwd
ls -la
find . -maxdepth 3 -name package.json
```

### App not reachable via domain

- Check DNS `A` record points to VPS.
- Check Nginx loaded config:

```bash
sudo nginx -t
sudo systemctl status nginx
```

- Check app is up:

```bash
pm2 status
```

### 502 Bad Gateway

Usually app process is down or wrong port in `proxy_pass`.

---

## 13) Security and Ops Best Practices

- Use SSH keys, disable password login if possible.
- Keep server packages updated.
- Restrict firewall ports (`22`, `80`, `443`).
- Do not run app as root in long term (create deploy user).
- Keep secrets only in server env files or secret manager.
- Add uptime monitor and error logging.

---

## 14) Suggested Files to Add (Optional)

- `CHANGELOG.md`
- `ecosystem.config.js` (PM2 config)
- `.env.example`
- `DEPLOY_CHECKLIST.md`

---

Owner: update this guide whenever release/deploy process changes.
