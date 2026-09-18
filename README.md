# VYRO — full-stack social app

A deployable **Next.js + Neon Postgres + Vercel** social application. This is source code, not a single HTML demo.

## Included now

- Account creation, login, secure httpOnly session cookie and logout
- Feed: image/video URL posts, Reels, delete own post, per-post audience
- Original music posts: attach an MP3/M4A/WAV audio URL or upload your own audio through Vercel Blob
- Likes, comments and in-app notifications
- Profiles, following, private profiles and follow requests
- Direct messages
- Explore search and trending hashtags
- Privacy tools: block account, change password, sign out other sessions
- Clean VYRO login/signup pages with Google, Facebook and phone sign-in options
- Owner-only Admin Console (member/post moderation; set `ADMIN_EMAIL` in Vercel)
- Bangla/English UI and demo accounts
- Neon-backed production persistence — posts, users, messages and all app state remain after Vercel deployments
- Optional Vercel Blob file upload (you can also use an image/video URL without it)

> **Database model:** VYRO stores its social collections in a Neon PostgreSQL `vyro_collections` JSONB table. It automatically creates that table and inserts demo data only on the first connection. This keeps the API flexible while data is permanently stored in Neon instead of Vercel's temporary filesystem.

## 1. Run locally

```bash
npm install
cp .env.example .env.local
# Put your Neon connection string in .env.local (or leave it blank for local demo-only JSON storage)
npm run dev
```

Open http://localhost:3000.

### Demo login

| Email | Password |
|---|---|
| `demo@vyro.app` | `password123` |
| `arif@vyro.app` | `password123` |
| `nusrat@vyro.app` | `password123` |
| `tanvir@vyro.app` | `password123` |

## 2. Put it on GitHub

Do **not** upload `.env.local`, `.env`, `node_modules`, `.next` or the `data/*.json` files. The included `.gitignore` handles this.

```bash
git init
git add .
git commit -m "Create VYRO full-stack app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/vyro.git
git push -u origin main
```

## 3. Deploy to Vercel + connect Neon

1. Create a free Neon project and copy the **pooled** PostgreSQL connection string from **Connection Details**.
2. Go to Vercel → **Add New → Project** → import the `vyro` GitHub repository.
3. Before deploying, add this under **Project → Settings → Environment Variables**:

   ```text
   DATABASE_URL = your Neon postgres connection string
   ADMIN_EMAIL = the email address you will use for your owner/admin VYRO account
   ```

   Select **Production**, **Preview**, and **Development**. First sign up to VYRO with the same `ADMIN_EMAIL`; after redeploying, that account gets the Admin Console.
4. Click **Deploy**. On the first visit, VYRO automatically creates its table and seeds the demo accounts.
5. For actual device photo/video uploading: Vercel → **Storage** → create a **Blob** store → connect it to this project. Vercel adds `BLOB_READ_WRITE_TOKEN` automatically. Until then, posting an image/video URL works normally.

Every push to the GitHub `main` branch triggers a fresh Vercel deployment. The Neon data remains intact.

## Social sign-in options

The clean login and create-account screens include **Google**, **Facebook**, and **phone number** buttons. Email/password works immediately. To make the three provider buttons complete a real login, add their provider credentials and SMS configuration first—Google requires an OAuth Client ID/Secret, Facebook requires a Meta App ID/Secret, and phone verification needs an SMS service. The UI deliberately does not pretend these services work without those secure credentials.

## Security notes

- Never commit or share `DATABASE_URL` / `BLOB_READ_WRITE_TOKEN`.
- Passwords are hashed using Node `scrypt` and salted before storage.
- Session cookies are `httpOnly`, `sameSite=lax`, and `secure` in production.
- For a large public launch, the next upgrade should be dedicated relational tables, rate limiting, email verification and a managed auth provider.

## Validate before deploying

```bash
npm run build
```

The project currently builds successfully with Next.js 14.2.35.
