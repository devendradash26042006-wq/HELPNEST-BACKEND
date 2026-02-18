# Local Services Backend

Minimal instructions for contributors.

Setup
1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:
```bash
npm install
```
3. Run locally:
```bash
npm run dev
```

Git workflow
- Use `main` as protected branch.
- Create feature branches: `feature/<short-desc>`.
- Open PRs targeting `main`, request reviews, and run CI.

Secrets
- Do NOT commit `serviceAccountKey.json` or `.env`.
- Store secrets in GitHub Secrets for CI.

If you want, I can initialize git and push this repo to GitHub for you — tell me whether you want me to use the GitHub CLI (`gh`) or provide a remote URL.
