import os
import sys
from pathlib import Path

# Add .scraper directory and project root to sys.path to allow standalone or module execution
SCRAPER_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRAPER_DIR.parent
if str(SCRAPER_DIR) not in sys.path:
    sys.path.insert(0, str(SCRAPER_DIR))
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Ensure UTF-8 output encoding across all terminals and OS environments
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any

from config import (
    DEFAULT_AUTO_APPROVE_HOURS,
    SURGE_AUTO_APPROVE_HOURS,
    SURGE_VIEW_THRESHOLD,
)
from db import DatabaseClient
from extractors import extract_post_metrics

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("ScraperRunner")


def process_submission(db: DatabaseClient, sub: Dict[str, Any]) -> Dict[str, Any]:
    sub_id = sub['id']
    post_url = sub['post_url']
    campaign = sub.get('campaign', {})
    cpm_rate = float(campaign.get('cpm_rate') or 2000)
    min_view_threshold = int(campaign.get('min_view_threshold') or 1000)

    logger.info(f"Auditing submission {sub_id[:8]}... | URL: {post_url}")

    # 1. Scrape post metrics
    result = extract_post_metrics(post_url)
    now_utc = datetime.now(timezone.utc)
    now_iso = now_utc.isoformat()

    # 2. Record verification audit log
    db.record_verification_check(
        submission_id=sub_id,
        post_reachable=result.reachable,
        view_count=result.view_count,
        raw_scrape=result.to_dict(),
        notes=f"Extractor: {result.extractor} | Platform: {result.platform} | Error: {result.error_message or 'None'}"
    )

    # 3. Handle unreachable / deleted posts
    if not result.reachable:
        logger.warning(f"Submission {sub_id[:8]} post is unreachable: {result.error_message}")
        prev_pending = float(sub.get('pending_payout_amount') or 0.0)
        updates = {
            "last_scraped_at": now_iso,
            "pending_payout_amount": 0,
            "auto_approve_at": None,
            "status": "verified_fail",
            "failure_reason": result.error_message or "Post is private, unreachable, or deleted within the 72-hour audit window.",
        }
        db.update_submission(sub_id, updates)

        # Reverse campaign spent/reserved budget if payout was pending
        if prev_pending > 0 and campaign.get('id'):
            db.update_campaign_budget(
                campaign_id=campaign['id'],
                spent_increment=-prev_pending,
                reserved_decrement=-prev_pending
            )

        return {
            "id": sub_id[:8],
            "platform": result.platform,
            "reachable": False,
            "views": 0,
            "status": "verified_fail",
            "payout": 0,
        }

    # 3.5 Author Handle Ownership Verification (Anti-Fraud)
    connected_handle = sub.get('social_account_handle')
    if connected_handle:
        import re
        def clean_handle(val: Any) -> str:
            if not val:
                return ""
            return re.sub(r'[\s\-_\.@]+', '', str(val).lower().strip())

        norm_handle = clean_handle(connected_handle)

        # Collect all candidate author identifiers returned by scraper
        candidates = []
        for cand_val in [result.uploader, result.uploader_id, result.channel]:
            if cand_val is not None:
                cand_raw = str(cand_val).strip().lstrip('@')
                if cand_raw and cand_raw not in candidates:
                    candidates.append(cand_raw)

        # Extract handle from channel_url if available
        if result.channel_url:
            url_match = re.search(r'/(?:@)?([a-zA-Z0-9_.\s-]{1,50})/?$', str(result.channel_url))
            if url_match:
                url_handle = url_match.group(1).strip()
                if url_handle not in candidates:
                    candidates.append(url_handle)

        if candidates:
            # Separate text usernames from purely numeric internal platform IDs (e.g. '100084729182')
            text_candidates = [c for c in candidates if not c.isdigit()]

            # Only evaluate mismatch if we have text usernames (avoid false positives on raw numeric IDs)
            if text_candidates:
                # Strict normalized equality (handles case, spaces, dots, underscores, but prevents substring spoofing)
                matched = any(norm_handle == clean_handle(c) for c in text_candidates)

                if not matched:
                    primary_author = text_candidates[0]
                    logger.warning(
                        f"Author mismatch for sub {sub_id[:8]}: scraped author '@{primary_author}' != connected handle '@{connected_handle}'"
                    )
                    updates = {
                        "last_scraped_at": now_iso,
                        "status": "verified_fail",
                        "failure_reason": f"Author ownership mismatch: This post was published by @{primary_author}, but your connected account is @{connected_handle}. You may only submit posts from your own account.",
                    }
                    db.update_submission(sub_id, updates)
                    return {
                        "id": sub_id[:8],
                        "platform": result.platform,
                        "reachable": True,
                        "views": 0,
                        "status": "verified_fail",
                        "payout": 0,
                    }

    # 3.6 Campaign Brief Compliance (Non-blocking: we extract and log caption/mentions/hashtags without failing submissions)
    post_text = f"{result.title or ''} {result.description or ''}".strip()
    logger.info(f"Scraped post caption / text for sub {sub_id[:8]}: {post_text[:100]}...")


    # 4. Process live view metrics
    scraped_views = result.view_count if result.view_count is not None else 0
    # Retain the highest observed view count (views don't decrease in reality)
    current_max_views = int(sub.get('final_view_count') or 0)
    final_views = max(scraped_views, current_max_views)

    last_paid_views = max(
        int(sub.get('last_paid_view_count') or 0),
        int(sub.get('max_verified_views') or 0)
    )

    updates: Dict[str, Any] = {
        "final_view_count": final_views,
        "last_scraped_at": now_iso,
        "verified_at": now_iso,
    }

    if result.like_count is not None:
        updates["likes_count"] = result.like_count
    if result.comment_count is not None:
        updates["comments_count"] = result.comment_count
    if result.share_count is not None:
        updates["shares_count"] = result.share_count
    if result.duration is not None:
        updates["watch_time_seconds"] = int(result.duration)

    # Check minimum threshold
    if final_views < min_view_threshold:
        logger.info(f"Submission {sub_id[:8]} views ({final_views}) < threshold ({min_view_threshold}). Keeping in pending.")
        updates.update({
            "pending_payout_amount": 0,
            "auto_approve_at": None,
            "status": "pending",
        })
        db.update_submission(sub_id, updates)
        return {
            "id": sub_id[:8],
            "platform": result.platform,
            "reachable": True,
            "views": final_views,
            "status": "pending (below threshold)",
            "payout": 0,
        }

    # Views exceed or equal minimum threshold -> Validated traffic
    new_views = max(0, final_views - last_paid_views)
    raw_gross = round((final_views / 1000.0) * cpm_rate)

    # 25% Creator Campaign Pool Cap Enforcement (Gross budget basis)
    total_budget = float(campaign.get('total_budget') or 0)
    creator_cap = (total_budget * 0.25) if total_budget > 0 else float('inf')
    gross_earned = min(raw_gross, creator_cap)

    updates.update({
        "status": "verified_pass",
        "verified_at": now_utc.isoformat(),
        "pending_payout_amount": 0,
    })

    db.update_submission(sub_id, updates)
    logger.info(f"Submission {sub_id[:8]} verified -> Views: {final_views:,} (New: {new_views:,}) | Est. Gross: ₦{gross_earned:,.0f} (Cap: ₦{creator_cap:,.0f})")

    # Real-time Campaign Budget Deduction (Brands pay gross)
    prev_tracked_spend = float(sub.get('last_tracked_gross') or sub.get('payout_amount') or 0.0)
    delta_spend = max(0.0, gross_earned - prev_tracked_spend)

    if delta_spend > 0:
        current_spent = float(campaign.get('spent_budget') or 0.0)
        new_spent = current_spent + delta_spend
        is_depleted = new_spent >= total_budget
        new_status = 'completed' if is_depleted else None
        db.update_campaign_budget(
            campaign_id=campaign['id'],
            spent_increment=delta_spend,
            reserved_decrement=delta_spend,
            new_status=new_status
        )

    return {
        "id": sub_id[:8],
        "platform": result.platform,
        "reachable": True,
        "views": final_views,
        "status": f"verified ({final_views:,} views)",
        "payout": gross_earned,
    }


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Social Metric Scraper & View Auditor")
    parser.add_argument("--force", action="store_true", help="Bypass 60-minute cooldown and audit all active submissions immediately")
    parser.add_argument("--id", type=str, default=None, help="Audit a specific submission ID immediately")
    args = parser.parse_args()

    logger.info("=== Starting Social Metric Scraper & View Auditor ===")
    
    try:
        db = DatabaseClient()
    except Exception as e:
        logger.error(f"Failed to initialize database client: {e}")
        sys.exit(1)

    submissions = db.fetch_active_submissions(force=args.force, submission_id=args.id)
    logger.info(f"Found {len(submissions)} submission(s) queued for auditing.")

    if not submissions:
        logger.info("No active submissions require auditing at this time. Exiting cleanly.")
        return

    import concurrent.futures

    summary_records = []
    max_workers = min(6, max(1, len(submissions)))
    logger.info(f"Auditing {len(submissions)} submission(s) concurrently with {max_workers} worker thread(s)...")

    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_sub = {executor.submit(process_submission, db, sub): sub for sub in submissions}
        for future in concurrent.futures.as_completed(future_to_sub):
            sub = future_to_sub[future]
            try:
                record = future.result()
                if record:
                    summary_records.append(record)
            except Exception as e:
                logger.error(f"Unhandled error auditing submission {sub.get('id')}: {e}")

    # Output Summary Table
    print("\n" + "=" * 78)
    print(f"{'SUBMISSION ID':<16} {'PLATFORM':<12} {'REACHABLE':<12} {'VIEWS':<10} {'PAYOUT':<12} {'STATUS':<14}")
    print("=" * 78)
    for rec in summary_records:
        reachable_str = "YES" if rec.get('reachable') else "NO"
        payout_str = f"NGN {rec.get('payout', 0):,}"
        print(f"{rec['id']:<16} {rec.get('platform', 'unknown'):<12} {reachable_str:<12} {rec.get('views', 0):<10} {payout_str:<12} {rec.get('status', 'unknown'):<14}")
    print("=" * 78 + "\n")
    logger.info("=== Social Metric Scraper Execution Finished Successfully ===")


if __name__ == '__main__':
    main()
