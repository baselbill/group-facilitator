<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Deployment

This project has TWO separate deployments:

1. **Next.js app** — auto-deploys to Vercel on push to `master` (no action needed)
2. **Partykit server** — must be deployed manually after changes to `party/server.ts`:
   ```
   npm run deploy:party
   ```

If you ship client changes that depend on new server behavior without re-deploying Partykit, the two will silently diverge.
