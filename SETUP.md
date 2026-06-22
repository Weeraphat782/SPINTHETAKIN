# Spin the Takin — Setup Guide

## 1. Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Run the migration file in the SQL editor:
   - Open `supabase/migrations/001_init.sql` and paste it into Supabase → SQL Editor → Run
3. Create Storage buckets (Supabase → Storage):
   - `prize-images` (public)
   - `branding-assets` (public)
   - `music` (public)
4. Deploy Edge Functions:
   ```
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase functions deploy session
   npx supabase functions deploy spin
   ```
5. Create an admin user (Supabase → Authentication → Users → Invite User).

## 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Run Locally

```bash
npm install
npm run dev
```

- Player UI: http://localhost:5173
- Admin panel: http://localhost:5173/admin

## 4. 3D Takin Model

Place a low-poly GLB file at `public/assets/takin.glb` to replace the placeholder primitive model.
The model should ideally include an idle animation (breathing/ear-twitch).

## 5. Sound Effects

Place optional MP3 files in `public/assets/`:
- `sfx-spin.mp3` — plays when the wheel starts spinning
- `sfx-win.mp3` — plays when the prize is revealed

Background music is uploaded via the Admin → Branding tab.

## 6. Deploy

```bash
npm run build
# Deploy dist/ folder to Vercel / Netlify / Cloudflare Pages
```

## 7. Admin Workflow

1. Open `/admin` and sign in with your Supabase user credentials.
2. Go to **Prizes** tab → add prizes with names, images, colors, and probability weights.
3. Go to **Branding** tab → upload logo and background music.
4. At the start of each new event day, go to **Settings** → Reset Device Locks.
5. Players can now use the public URL to spin!
