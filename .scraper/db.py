import json
import logging
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime, timezone
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

    def fetch_active_submissions(self) -> List[Dict[str, Any]]:
        """
        Fetches submissions that need metric auditing:
        - status IN ('pending', 'auditing', 'verified_pass')
        - post_url IS NOT NULL
        """
        url = f"{self.rest_url}/submissions"
        params = {
            "select": "id,creator_id,campaign_id,social_account_id,post_url,status,final_view_count,last_paid_view_count,max_verified_views,pending_payout_amount,submitted_at,last_scraped_at",
            "post_url": "not.is.null",
            "status": "in.(pending,auditing,verified_pass)",
            "order": "last_scraped_at.asc.nullsfirst,submitted_at.desc",
            "limit": str(BATCH_SIZE),
        }

        resp = self._http_request("GET", url, params=params)
        if resp["status_code"] != 200:
            logger.error(f"Error fetching submissions (HTTP {resp['status_code']}): {resp['error']}")
            return []

        submissions = resp["data"] or []
        if not submissions:
            return []

        # Fetch campaign rules for each submission
        campaign_ids = list(set([s['campaign_id'] for s in submissions if s.get('campaign_id')]))
        campaigns_map = self._fetch_campaigns_by_ids(campaign_ids)

        # Fetch connected social account handles for author ownership matching
        social_ids = list(set([s['social_account_id'] for s in submissions if s.get('social_account_id')]))
        social_map = self._fetch_social_accounts_by_ids(social_ids)

        for sub in submissions:
            sub['campaign'] = campaigns_map.get(sub.get('campaign_id'), {})
            social_acc = social_map.get(sub.get('social_account_id'), {})
            sub['social_account_handle'] = social_acc.get('handle')
            sub['social_account_platform'] = social_acc.get('platform')

        return submissions

    def _fetch_campaigns_by_ids(self, campaign_ids: List[str]) -> Dict[str, Dict[str, Any]]:
        if not campaign_ids:
            return {}

        url = f"{self.rest_url}/campaigns"
        params = {
            "id": f"in.({','.join(campaign_ids)})",
            "select": "id,title,cpm_rate,min_view_threshold,total_budget,reserved_budget,spent_budget,status",
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
