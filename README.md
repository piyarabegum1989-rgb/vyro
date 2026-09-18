# VIRO — mobile social app

A mobile-first **Next.js + Neon Postgres + Vercel Blob** social app. It is a real application source package, not a browser-only HTML mock-up.

## VIRO mobile screens included

- Animated VIRO splash screen using the supplied V logo
- Home feed with Stories, photo/video posts, reactions, comments, save and share controls
- Explore search, categories and photo/reel grid
- Profile with persistent profile photo and cover-photo upload controls
- Reels
- Instagram-style direct-message inbox and conversation screen, including image/video messages, unread counts and seen status
- Full-screen Post / Reel / Story composer, photo/video gallery picker, location, privacy and VIRO Music picker (starter sounds, public creator sounds and original-music upload)
- Notifications with All, Likes, Comments and Follows tabs
- Profile drawer: Profile, Messages, Community, Settings & privacy, Logout
- Community drawer keeps Marketplace (BDT), Circles, Groups and Events discoverable
- Owner-only Admin Console: only the server-side `ADMIN_EMAIL` account receives the Admin menu and routes

## Production services required

1. **Neon Postgres** keeps accounts, posts, messages, reactions and profile metadata persistent across deployments.
2. **Vercel Blob** stores phone/computer gallery uploads — profile image, cover image, post image/video, message media and music.

Email/password authentication works immediately. Passwords are salted and hashed with Node `scrypt`; browser sessions use httpOnly cookies. The Google, Facebook and phone buttons are visual placeholders until their respective OAuth/SMS credentials are connected.

## Deploy into the existing GitHub + Vercel project

Do **not** create another Vercel project.

1. Upload/replace this source in the existing `piyarabegum1989-rgb/vyro` GitHub repository and commit to `main`.
2. In the already-connected Vercel project, open **Settings → Environment Variables** and add:

   ```text
   DATABASE_URL=your Neon pooled PostgreSQL connection string
   ADMIN_EMAIL=the email address of your own VIRO account
   ```

3. In **Vercel → Storage**, create or connect a **Blob** store to this existing project. Vercel provides `BLOB_READ_WRITE_TOKEN`; do not type or expose it in browser code.
4. Redeploy. First create/log in to the account that uses `ADMIN_EMAIL`; only this account gets the Admin Console link.

No demo email or demo password is supplied or prefilled in the VIRO login UI.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Use `npm run build` before deployment.

## Security and rollout notes

- Never commit `.env.local`, `DATABASE_URL` or `BLOB_READ_WRITE_TOKEN`.
- File upload requires Vercel Blob in production. The API returns a clear error if the store is not connected instead of pretending an upload succeeded.
- VIRO Music starts with three original starter loops and public creator-uploaded sounds. A catalog of commercial TikTok/Instagram songs requires a music-licensing provider; do not add copyrighted songs without rights.
- The initial Neon adapter preserves the existing JSON collection model in one durable Postgres table. For a very large public launch, migrate to dedicated relational tables, add email verification, rate limiting and a managed realtime provider.
