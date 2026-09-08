import unittest
from extractors.linkedin import extract_linkedin_identifiers, extract_linkedin_post
from extractors.base import ScrapeResult

class TestLinkedInExtractor(unittest.TestCase):

    def test_extract_identifiers(self):
        handle, urn = extract_linkedin_identifiers("https://www.linkedin.com/posts/tuazor-omtu_viral-marketing-nigeria-activity-7123456789012345678-abcd")
        self.assertEqual(handle, "tuazor-omtu")
        self.assertEqual(urn, "7123456789012345678")

        handle, urn = extract_linkedin_identifiers("https://www.linkedin.com/feed/update/urn:li:activity:7999888777666555444/")
        self.assertIsNone(handle)
        self.assertEqual(urn, "7999888777666555444")

        handle, urn = extract_linkedin_identifiers("https://www.linkedin.com/feed/update/urn:li:share:123456789/")
        self.assertIsNone(handle)
        self.assertEqual(urn, "123456789")

    def test_invalid_linkedin_url(self):
        res = extract_linkedin_post("https://www.linkedin.com/feed/update/urn:li:activity:0000000000000000000")
        self.assertIsInstance(res, ScrapeResult)
        self.assertEqual(res.platform, "linkedin")

if __name__ == '__main__':
    unittest.main()
