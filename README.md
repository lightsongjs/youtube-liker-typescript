# YouTube Liked Videos Manager - TypeScript Edition

A keyboard-driven interface for managing YouTube liked videos, built with TypeScript, Supabase, and Vercel.

## Architecture

- **Frontend**: Static HTML/CSS/JS hosted on Vercel
- **Backend**: Supabase Edge Functions (TypeScript)
- **Database**: Supabase PostgreSQL (already migrated with 2413 videos, 10 tags, 1531 relationships)

## Setup Instructions

### 1. Get Supabase Anonymous Key

1. Go to https://supabase.com/dashboard/project/xtvusvangjsqxsxcqnte
2. Click on "Settings" → "API"
3. Copy the `anon` `public` key
4. Update `public/index.html` line 125 with your key:
   ```javascript
   const SUPABASE_ANON_KEY = 'your-anon-key-here';
   ```

### 2. Deploy Supabase Edge Function

```bash
# Link to your Supabase project
supabase link --project-ref xtvusvangjsqxsxcqnte

# Deploy the Edge Function
supabase functions deploy api
```

### 3. Deploy Frontend to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import the GitHub repository
3. Set root directory to: `./`
4. Set output directory to: `public`
5. Click "Deploy"

#### Option B: Via Vercel CLI

```bash
vercel --prod
```

### 4. Push to GitHub

```bash
git add .
git commit -m "Initial TypeScript migration"
git remote add origin https://github.com/YOUR_USERNAME/youtube-liker-typescript.git
git push -u origin master
```

## Project Structure

```
youtube-liker-typescript/
├── public/
│   └── index.html          # Frontend interface
├── supabase/
│   ├── functions/
│   │   └── api/
│   │       └── index.ts    # Edge Function API handler
│   └── config.toml         # Supabase configuration
├── types/
│   └── database.types.ts   # TypeScript type definitions
├── package.json
├── vercel.json             # Vercel configuration
└── README.md
```

## API Endpoints (Supabase Edge Functions)

All endpoints are available at: `https://xtvusvangjsqxsxcqnte.supabase.co/functions/v1/api`

- `GET /api/tags` - Get all tags
- `POST /api/tags` - Create new tag
- `DELETE /api/tags/:id` - Delete tag
- `GET /api/videos` - Get videos with pagination and filtering
- `POST /api/videos/toggle-tag` - Toggle tag on video
- `POST /api/videos/unlike` - Unlike a video
- `POST /api/videos/caption` - Mark video as needing caption

## Keyboard Shortcuts

- `j` / `k` - Navigate down/up
- `u` - Unlike current video
- `c` - Mark video as needing caption
- `Enter` - Open video in new tab
- `m` / `t` / `i` / etc. - Toggle tags (based on tag keystroke)

## Database Schema

Already exists in Supabase with:

**videos** table:
- 2413 videos
- Columns: video_id, title, channel_id, channel_title, url, duration_seconds, is_short, captions, saved_at, liked_status, is_music, is_theological, is_interesting, needs_caption

**tags** table:
- 10 tags
- Columns: id, name, keystroke, color

**video_tags** junction table:
- 1531 relationships
- Columns: video_id, tag_id

## Environment Variables

### Supabase Edge Functions

Set these via Supabase dashboard or CLI:

```bash
supabase secrets set SUPABASE_URL=https://xtvusvangjsqxsxcqnte.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your-anon-key
```

### Frontend (Hardcoded in index.html)

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Development

### Run Supabase Functions Locally

```bash
supabase functions serve api
```

### Test Frontend Locally

```bash
# Simple HTTP server
python3 -m http.server 8000 --directory public

# Or use any other static file server
npx serve public
```

Then open http://localhost:8000

## Deployment Workflow

1. Make changes to code
2. Test locally
3. Commit to Git
4. Push to GitHub
5. Vercel auto-deploys frontend
6. Deploy Edge Functions: `supabase functions deploy api`

## Cost

- **Vercel**: $0/month (Hobby plan)
- **Supabase**: $0/month (Free tier)
- **Total**: $0/month ✅

## Migration from Python Version

This project is a complete TypeScript rewrite of the original Python/FastAPI version. All backend logic has been converted to Supabase Edge Functions, and the database is already migrated.

---

Generated: December 30, 2025
