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
        updates = {
            "last_scraped_at": now_iso,
            "status": "verified_fail",
            "failure_reason": result.error_message or "Post is private, unreachable, or deleted.",
        }
        db.update_submission(sub_id, updates)
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
        norm_handle = str(connected_handle).strip().lstrip('@').lower()

        # Collect all candidate author identifiers returned by scraper
        candidates = []
        for cand_val in [result.uploader, result.uploader_id, result.channel]:
            if cand_val is not None:
                cand_str = str(cand_val).strip().lstrip('@').lower()
                if cand_str and cand_str not in candidates:
                    candidates.append(cand_str)

        # Extract handle from channel_url if available
        if result.channel_url:
            import re
            url_match = re.search(r'/(?:@)?([a-zA-Z0-9_.-]{1,30})/?$', str(result.channel_url))
            if url_match:
                url_handle = url_match.group(1).lower()
                if url_handle not in candidates:
                    candidates.append(url_handle)

        if candidates:
            # Separate text usernames from purely numeric internal platform IDs (e.g. '100084729182')
            text_candidates = [c for c in candidates if not c.isdigit()]

            # Only evaluate mismatch if we have text usernames (avoid false positives on raw numeric IDs)
            if text_candidates:
                matched = any(
                    norm_handle == c or norm_handle in c or c in norm_handle
                    for c in text_candidates
                )

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

    # Views exceed or equal minimum threshold -> Compute pending incremental payout
    new_views = max(0, final_views - last_paid_views)
    raw_payout = round((new_views / 1000.0) * cpm_rate)

    # 25% Creator Campaign Pool Cap Enforcement
    total_budget = float(campaign.get('total_budget') or 0)
    creator_cap = (total_budget * 0.25) if total_budget > 0 else float('inf')
    already_paid = float(sub.get('payout_amount') or 0)
    max_allowable = max(0.0, creator_cap - already_paid)
    incremental_payout = min(raw_payout, int(max_allowable))

    # Surge Protection: Surge >= 50k views gets 24h grace window, else 1h
    is_surge = new_views >= SURGE_VIEW_THRESHOLD
    grace_hours = SURGE_AUTO_APPROVE_HOURS if is_surge else DEFAULT_AUTO_APPROVE_HOURS
    auto_approve_at = (now_utc + timedelta(hours=grace_hours)).isoformat()

    updates.update({
        "pending_payout_amount": incremental_payout,
        "auto_approve_at": auto_approve_at,
        "status": "pending" if sub.get("status") != "verified_pass" else "verified_pass",
    })

    db.update_submission(sub_id, updates)
    logger.info(f"Submission {sub_id[:8]} updated -> Views: {final_views} | New Views: {new_views} | Pending Payout: ₦{incremental_payout:,} (Cap: ₦{creator_cap:,.0f}) | Status: {updates['status']}")

    return {
        "id": sub_id[:8],
        "platform": result.platform,
        "reachable": True,
        "views": final_views,
        "status": f"verified ({final_views:,} views)",
        "payout": incremental_payout,
    }


def main():
    logger.info("=== Starting Social Metric Scraper & View Auditor ===")
    
    try:
        db = DatabaseClient()
    except Exception as e:
        logger.error(f"Failed to initialize database client: {e}")
        sys.exit(1)

    submissions = db.fetch_active_submissions()
    logger.info(f"Found {len(submissions)} submission(s) queued for auditing.")

    if not submissions:
        logger.info("No active submissions require auditing at this time. Exiting cleanly.")
        return

    summary_records = []
    for sub in submissions:
        try:
            record = process_submission(db, sub)
            summary_records.append(record)
        except Exception as e:
            logger.error(f"Error processing submission {sub.get('id')}: {e}")

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
