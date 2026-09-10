import json
import logging
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
try:
    from .config import (
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
        BATCH_SIZE,
        REQUEST_TIMEOUT,
    )
except (ImportError, ValueError):
    from config import (
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
        BATCH_SIZE,
        REQUEST_TIMEOUT,
    )

logger = logging.getLogger(__name__)

class DatabaseClient:
    """
    Direct REST interface to Supabase for the Scraper Engine.
    Uses PostgREST HTTP headers with the service_role key to bypass RLS policies.
    Implemented with Python standard library urllib to guarantee 100% dependency-free operation.
    """
    def __init__(self):
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            raise ValueError(
                "Missing Supabase credentials. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
            )
        
        self.base_url = SUPABASE_URL.rstrip('/')
        self.rest_url = f"{self.base_url}/rest/v1"
        self.headers = {
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

    def _http_request(self, method: str, url: str, data: Optional[Dict[str, Any]] = None, params: Optional[Dict[str, str]] = None):
        if params:
            query_string = urllib.parse.urlencode(params)
            url = f"{url}?{query_string}"

        custom_headers = dict(self.headers)
        if method in ("PATCH", "POST"):
            custom_headers["Prefer"] = "return=minimal"

        req = urllib.request.Request(url, headers=custom_headers, method=method)
        body = json.dumps(data).encode('utf-8') if data is not None else None

        try:
            with urllib.request.urlopen(req, data=body, timeout=REQUEST_TIMEOUT) as response:
                status_code = response.getcode()
                resp_bytes = response.read()
                resp_text = resp_bytes.decode('utf-8') if resp_bytes else ""
                return {
                    "status_code": status_code,
                    "data": json.loads(resp_text) if resp_text else None,
                    "error": None,
                }
        except urllib.error.HTTPError as e:
            err_text = e.read().decode('utf-8', errors='ignore')
            return {
                "status_code": e.code,
                "data": None,
                "error": err_text,
            }
        except Exception as e:
            return {
                "status_code": 500,
                "data": None,
                "error": str(e),
            }

    def fetch_active_submissions(self, force: bool = False, submission_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Fetches submissions that are currently DUE for metric auditing:
        - 1st audit: submitted_at <= (NOW - 60 minutes) when last_scraped_at is null
        - Recurring audits: last_scraped_at <= (NOW - 60 minutes) as long as campaign is 'live'
        - If force=True or submission_id is set: bypasses the 60m cooldown for immediate on-demand auditing.
        """
        submissions = None

        # 0. On-demand single submission lookup
        if submission_id:
            url = f"{self.rest_url}/submissions"
            params = {
                "id": f"eq.{submission_id}",
                "select": "id,creator_id,campaign_id,social_account_id,post_url,status,final_view_count,last_paid_view_count,max_verified_views,pending_payout_amount,payout_amount,submitted_at,last_scraped_at",
            }
            resp = self._http_request("GET", url, params=params)
            submissions = resp["data"] or [] if resp["status_code"] == 200 else []
            logger.info(f"Direct lookup for submission {submission_id[:8]}: found {len(submissions)} match.")

        # 1. Force mode: audit all active submissions without 60-minute wait
        elif force:
            url = f"{self.rest_url}/submissions"
            params = {
                "select": "id,creator_id,campaign_id,social_account_id,post_url,status,final_view_count,last_paid_view_count,max_verified_views,pending_payout_amount,payout_amount,submitted_at,last_scraped_at",
                "post_url": "not.is.null",
                "status": "in.(pending,verified_pass)",
                "order": "last_scraped_at.asc.nullsfirst,submitted_at.desc",
                "limit": str(BATCH_SIZE * 2),
            }
            resp = self._http_request("GET", url, params=params)
            submissions = resp["data"] or [] if resp["status_code"] == 200 else []
            logger.info(f"Force mode: retrieved {len(submissions)} active submission(s) bypassing cooldown.")

        # 2. Standard scheduled flow: server-side Postgres RPC
        else:
            rpc_url = f"{self.rest_url}/rpc/get_due_submissions"
            rpc_resp = self._http_request("POST", rpc_url, data={"batch_limit": BATCH_SIZE})
            if rpc_resp["status_code"] == 200 and isinstance(rpc_resp["data"], list):
                submissions = rpc_resp["data"]
                logger.info(f"Retrieved {len(submissions)} due submission(s) via database RPC.")

        # 3. Fallback to REST endpoint with Python-side cooldown validation
        if submissions is None:
            url = f"{self.rest_url}/submissions"
            params = {
                "select": "id,creator_id,campaign_id,social_account_id,post_url,status,final_view_count,last_paid_view_count,max_verified_views,pending_payout_amount,payout_amount,submitted_at,last_scraped_at",
                "post_url": "not.is.null",
                "status": "in.(pending,verified_pass)",
                "order": "last_scraped_at.asc.nullsfirst,submitted_at.desc",
                "limit": str(BATCH_SIZE * 2),
            }

            resp = self._http_request("GET", url, params=params)
            if resp["status_code"] != 200:
                logger.error(f"Error fetching submissions (HTTP {resp['status_code']}): {resp['error']}")
                return []

            raw_subs = resp["data"] or []
            now = datetime.now(timezone.utc)
            submissions = []

            for s in raw_subs:
                sub_at_raw = s.get('submitted_at')
                if not sub_at_raw:
                    continue
                try:
                    sub_at = datetime.fromisoformat(sub_at_raw.replace('Z', '+00:00'))
                except Exception:
                    continue

                last_scrape_raw = s.get('last_scraped_at')
                age = now - sub_at

                # Submissions are continuously audited while the campaign is 'live' (no 72-hour cutoff)

                # Brand new submission cooldown: 60 minutes
                if not last_scrape_raw:
                    if age >= timedelta(minutes=60):
                        submissions.append(s)
                    continue

                # Recurring audit cooldown: 60 minutes
                try:
                    last_scrape = datetime.fromisoformat(last_scrape_raw.replace('Z', '+00:00'))
                    if (now - last_scrape) >= timedelta(minutes=60):
                        submissions.append(s)
                except Exception:
                    submissions.append(s)

                if len(submissions) >= BATCH_SIZE:
                    break

        if not submissions:
            return []

        # Fetch campaign rules for each submission
        campaign_ids = list(set([s['campaign_id'] for s in submissions if s.get('campaign_id')]))
        campaigns_map = self._fetch_campaigns_by_ids(campaign_ids)

        # Fetch connected social account handles for author ownership matching
        social_ids = list(set([s['social_account_id'] for s in submissions if s.get('social_account_id')]))
        social_map = self._fetch_social_accounts_by_ids(social_ids)

        active_submissions = []
        for sub in submissions:
            camp = campaigns_map.get(sub.get('campaign_id'), {})
            camp_status = (camp.get('status') or '').lower()
            if camp_status != 'live':
                logger.info(f"Skipping sub {sub['id'][:8]}: Campaign '{camp.get('title', 'Unknown')}' is '{camp_status}', not 'live'.")
                continue

            sub['campaign'] = camp
            social_acc = social_map.get(sub.get('social_account_id'), {})
            sub['social_account_handle'] = social_acc.get('handle')
            sub['social_account_platform'] = social_acc.get('platform')
            active_submissions.append(sub)

        return active_submissions

    def _fetch_campaigns_by_ids(self, campaign_ids: List[str]) -> Dict[str, Dict[str, Any]]:
        if not campaign_ids:
            return {}

        url = f"{self.rest_url}/campaigns"
        params = {
            "id": f"in.({','.join(campaign_ids)})",
            "select": "id,title,cpm_rate,min_view_threshold,total_budget,reserved_budget,spent_budget,status,requirements",
        }

        resp = self._http_request("GET", url, params=params)
        if resp["status_code"] == 200 and resp["data"]:
            return {c['id']: c for c in resp["data"]}

        return {}

    def _fetch_social_accounts_by_ids(self, social_ids: List[str]) -> Dict[str, Dict[str, Any]]:
        if not social_ids:
            return {}

        url = f"{self.rest_url}/social_accounts"
        params = {
            "id": f"in.({','.join(social_ids)})",
            "select": "id,platform,handle,display_name",
        }

        resp = self._http_request("GET", url, params=params)
        if resp["status_code"] == 200 and resp["data"]:
            return {s['id']: s for s in resp["data"]}

        return {}

    def record_verification_check(
        self,
        submission_id: str,
        post_reachable: bool,
        view_count: Optional[int],
        raw_scrape: Optional[Dict[str, Any]] = None,
        notes: Optional[str] = None
    ) -> bool:
        """
        Inserts an audit record into the verification_checks ledger.
        """
        url = f"{self.rest_url}/verification_checks"
        payload = {
            "submission_id": submission_id,
            "checked_at": datetime.now(timezone.utc).isoformat(),
            "post_reachable": post_reachable,
            "view_count": view_count,
            "raw_scrape": raw_scrape or {},
            "notes": notes,
        }

        resp = self._http_request("POST", url, data=payload)
        if resp["status_code"] in (200, 201):
            return True
        else:
            logger.error(f"Failed to insert verification check (HTTP {resp['status_code']}): {resp['error']}")
            return False

    def update_submission(self, submission_id: str, updates: Dict[str, Any]) -> bool:
        """
        Updates the submission status, view counts, and payout metrics.
        """
        url = f"{self.rest_url}/submissions"
        params = {"id": f"eq.{submission_id}"}

        resp = self._http_request("PATCH", url, data=updates, params=params)
        if resp["status_code"] in (200, 204):
            return True
        else:
            logger.error(f"Failed to update submission {submission_id} (HTTP {resp['status_code']}): {resp['error']}")
            return False

    def record_submission_audit(
        self,
        submission_id: str,
        campaign_id: str,
        creator_id: str,
        views_scraped: int,
        views_delta: int,
        payout_amount: float,
        status: str = "auto_approved"
    ) -> bool:
        """
        Inserts an audit record into submission_audits ledger upon scraper verification.
        """
        url = f"{self.rest_url}/submission_audits"
        payload = {
            "submission_id": submission_id,
            "campaign_id": campaign_id,
            "creator_id": creator_id,
            "views_scraped": views_scraped,
            "views_delta": views_delta,
            "payout_amount": payout_amount,
            "status": status,
            "settled_at": datetime.now(timezone.utc).isoformat(),
        }

        resp = self._http_request("POST", url, data=payload)
        if resp["status_code"] in (200, 201):
            return True
        else:
            logger.error(f"Failed to insert submission audit record (HTTP {resp['status_code']}): {resp['error']}")
            return False

    def update_campaign_budget(self, campaign_id: str, spent_increment: float, reserved_decrement: float, new_status: Optional[str] = None) -> bool:
        """
        Updates the campaign spent_budget, reserved_budget, and status.
        Uses atomic Postgres RPC with row-level locking to eliminate race conditions.
        Falls back to direct REST PATCH if RPC is unavailable.
        """
        # 1. Attempt atomic Postgres RPC with row-level locking
        rpc_url = f"{self.rest_url}/rpc/atomic_update_campaign_budget"
        rpc_payload = {
            "p_campaign_id": campaign_id,
            "p_spent_increment": spent_increment,
            "p_reserved_decrement": reserved_decrement,
            "p_new_status": new_status,
        }
        rpc_resp = self._http_request("POST", rpc_url, data=rpc_payload)
        if rpc_resp["status_code"] == 200:
            return True

        # 2. Fallback to direct REST PATCH
        url = f"{self.rest_url}/campaigns"
        params = {"id": f"eq.{campaign_id}"}
        
        campaign_map = self._fetch_campaigns_by_ids([campaign_id])
        campaign = campaign_map.get(campaign_id)
        if not campaign:
            return False
            
        current_spent = float(campaign.get('spent_budget') or 0.0)
        current_reserved = float(campaign.get('reserved_budget') or 0.0)
        
        payload = {
            "spent_budget": current_spent + spent_increment,
            "reserved_budget": max(0.0, current_reserved - reserved_decrement),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        if new_status:
            payload["status"] = new_status
            
        resp = self._http_request("PATCH", url, data=payload, params=params)
        return resp["status_code"] in (200, 204)
