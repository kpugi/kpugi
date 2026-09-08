import unittest
from extractors import detect_platform, canonicalize_url

class TestRouter(unittest.TestCase):

    def test_platform_detection(self):
        # 1. YouTube
        self.assertEqual(detect_platform("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), "youtube")
        self.assertEqual(detect_platform("https://youtu.be/dQw4w9WgXcQ"), "youtube")
        self.assertEqual(detect_platform("https://www.youtube.com/shorts/abcdef12345"), "youtube")

        # 2. X / Twitter
        self.assertEqual(detect_platform("https://x.com/user/status/1234567890"), "x")
        self.assertEqual(detect_platform("https://twitter.com/user/status/1234567890"), "x")

        # 3. TikTok
        self.assertEqual(detect_platform("https://www.tiktok.com/@creator/video/1234567890"), "tiktok")
        self.assertEqual(detect_platform("https://vm.tiktok.com/ZMxxxxxx/"), "tiktok")

        # 4. Instagram
        self.assertEqual(detect_platform("https://www.instagram.com/reel/C6Wd4T_OqXp/"), "instagram")
        self.assertEqual(detect_platform("https://www.instagram.com/p/DF123abc/"), "instagram")

        # 5. Facebook
        self.assertEqual(detect_platform("https://www.facebook.com/reel/123456789/"), "facebook")
        self.assertEqual(detect_platform("https://fb.watch/xyz123/"), "facebook")
        self.assertEqual(detect_platform("https://www.facebook.com/user/posts/123456789"), "facebook")
        self.assertEqual(detect_platform("https://www.facebook.com/photo.php?fbid=987654"), "facebook")

        # 6. LinkedIn
        self.assertEqual(detect_platform("https://www.linkedin.com/posts/tuazor_title-activity-7123456789-abcd"), "linkedin")
        self.assertEqual(detect_platform("https://www.linkedin.com/feed/update/urn:li:activity:7123456789/"), "linkedin")

    def test_ssrf_blocking(self):
        url, plat = canonicalize_url("http://localhost/hack")
        self.assertIsNone(plat)

        url, plat = canonicalize_url("http://169.254.169.254/latest/meta-data/")
        self.assertIsNone(plat)

        url, plat = canonicalize_url("http://192.168.1.1/admin")
        self.assertIsNone(plat)

        url, plat = canonicalize_url("https://malicious.com/fake")
        self.assertIsNone(plat)

if __name__ == '__main__':
    unittest.main()
