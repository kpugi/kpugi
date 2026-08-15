from dataclasses import dataclass, asdict, field
from typing import Optional, Dict, Any

@dataclass
class ScrapeResult:
    reachable: bool
    view_count: Optional[int] = None
    like_count: Optional[int] = None
    comment_count: Optional[int] = None
    share_count: Optional[int] = None
    duration: Optional[float] = None
    uploader: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    platform: str = "unknown"
    extractor: str = "unknown"
    error_message: Optional[str] = None
    raw: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
