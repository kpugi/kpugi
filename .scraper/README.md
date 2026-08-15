# 🚀 Social Metric Scraper & View Auditing System

Autonomous metric scraping and auditing engine powered by **`yt-dlp`** with fallback extractors across TikTok, Instagram, YouTube, X (Twitter), Facebook, Threads, and LinkedIn.

---

## 📁 Architecture Overview

```text
.scraper/
├── extractors/
│   ├── __init__.py            # Platform detector & multi-layer fallback router
│   ├── base.py                # ScrapeResult dataclass
│   ├── ytdlp_extractor.py     # Universal yt-dlp metadata engine (no binary downloads)
│   └── fallbacks.py           # Fallback scrapers for X syndication, TikTok/YT oEmbed
├── config.py                  # Environment variable loader
├── db.py                      # Supabase PostgREST database client
├── runner.py                  # Main execution entry point
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

---

## 🛠 Local Setup & Testing

### 1. Install Dependencies
```bash
python -m venv .scraper/venv
# Windows:
.scraper\venv\Scripts\activate
# macOS/Linux:
source .scraper/venv/bin/activate

pip install -r .scraper/requirements.txt
```

### 2. Environment Variables
Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` exist in `.env.local` or `.env` in the root folder, or export them in your shell:
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-secret"
```

### 3. Run the Scraper
```bash
python -m .scraper.runner
# OR from within .scraper directory:
python runner.py
```

---

## ⚙️ GitHub Actions Automation

The scraper runs automatically via GitHub Actions:
- **Scheduled Cron**: Runs every 15 minutes (`*/15 * * * *`).
- **Manual Trigger**: Can be dispatched manually from the GitHub Actions tab.
- **Webhook Dispatch**: Can be triggered via GitHub `repository_dispatch` when a creator submits a video.

### Required GitHub Repository Secrets
Go to your GitHub Repository > **Settings** > **Secrets and variables** > **Actions** and add:
1. `SUPABASE_URL`: Your Supabase Project URL (`https://xyz.supabase.co`).
2. `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role secret key.
