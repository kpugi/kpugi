import os
from pathlib import Path

# Search for .env files in multiple parent directories for convenience
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

# Lightweight built-in env parser if python-dotenv is not installed
def load_env_file(path: Path):
    if not path.exists():
        return
    try:
        with open(path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#') or '=' not in line:
                    continue
                k, v = line.split('=', 1)
                k = k.strip()
                v = v.strip().strip("'\"")
                if k not in os.environ:
                    os.environ[k] = v
    except Exception:
        pass

try:
    from dotenv import load_dotenv
    for env_file in [BASE_DIR / ".env", PROJECT_ROOT / ".env.local", PROJECT_ROOT / ".env"]:
        if env_file.exists():
            load_dotenv(dotenv_path=env_file, override=False)
except ImportError:
    for env_file in [BASE_DIR / ".env", PROJECT_ROOT / ".env.local", PROJECT_ROOT / ".env"]:
        load_env_file(env_file)

# Supabase Credentials
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_KEY")
    or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
)

# Scraper Settings
REQUEST_TIMEOUT = int(os.getenv("SCRAPER_REQUEST_TIMEOUT", "30"))
BATCH_SIZE = int(os.getenv("SCRAPER_BATCH_SIZE", "50"))
SURGE_VIEW_THRESHOLD = int(os.getenv("SCRAPER_SURGE_THRESHOLD", "50000"))
DEFAULT_AUTO_APPROVE_HOURS = int(os.getenv("SCRAPER_AUTO_APPROVE_HOURS", "24"))
SURGE_AUTO_APPROVE_HOURS = int(os.getenv("SCRAPER_SURGE_HOURS", "24"))

# Standard Browser User-Agent
DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)

# Cookie File (Optional)
COOKIES_FILE = BASE_DIR / "cookies.txt"
