import unittest
from extractors.instagram import extract_instagram_shortcode, extract_instagram_post
from extractors.base import ScrapeResult

class TestInstagramExtractor(unittest.TestCase):

    def test_shortcode_extraction(self):
        self.assertEqual(extract_instagram_shortcode("https://www.instagram.com/reel/C6Wd4T_OqXp/"), "C6Wd4T_OqXp")
        self.assertEqual(extract_instagram_shortcode("https://instagram.com/p/DF123abc_-/"), "DF123abc_-")
        self.assertEqual(extract_instagram_shortcode("https://www.instagram.com/reels/Cxyz987"), "Cxyz987")
        self.assertEqual(extract_instagram_shortcode("https://www.instagram.com/tv/Bxyz987/"), "Bxyz987")
        self.assertIsNone(extract_instagram_shortcode("https://www.instagram.com/direct/inbox/"))

    def test_invalid_url_returns_unreachable(self):
        res = extract_instagram_post("https://www.instagram.com/invalid/url")
        self.assertFalse(res.reachable)
        self.assertEqual(res.platform, "instagram")

    def test_deleted_or_nonexistent_post(self):
        # Very old or random fake shortcode
        res = extract_instagram_post("https://www.instagram.com/p/ZZZZZZZZZZZ_nonexistent/")
        # Must either fail cleanly or return unreachable without throwing exception
        self.assertIsInstance(res, ScrapeResult)
        self.assertEqual(res.platform, "instagram")

if __name__ == '__main__':
    unittest.main()
