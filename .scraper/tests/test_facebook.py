import unittest
from extractors.facebook import classify_facebook_url, extract_facebook_post
from extractors.base import ScrapeResult

class TestFacebookExtractor(unittest.TestCase):

    def test_classify_video_and_reels(self):
        post_type, user, cid = classify_facebook_url("https://www.facebook.com/reel/1234567890/")
        self.assertEqual(post_type, "video")
        self.assertEqual(cid, "1234567890")

        post_type, user, cid = classify_facebook_url("https://fb.watch/xyzAbc123/")
        self.assertEqual(post_type, "video")

        post_type, user, cid = classify_facebook_url("https://www.facebook.com/watch/?v=987654321")
        self.assertEqual(post_type, "video")
        self.assertEqual(cid, "987654321")

        post_type, user, cid = classify_facebook_url("https://www.facebook.com/creators_hub/videos/1122334455/")
        self.assertEqual(post_type, "video")
        self.assertEqual(user, "creators_hub")
        self.assertEqual(cid, "1122334455")

    def test_classify_photos_and_carousels(self):
        post_type, user, cid = classify_facebook_url("https://www.facebook.com/photo.php?fbid=555666777")
        self.assertEqual(post_type, "photo")
        self.assertEqual(cid, "555666777")

        post_type, user, cid = classify_facebook_url("https://www.facebook.com/kpugi_hq/photos/a.123/456789/")
        self.assertEqual(post_type, "photo")
        self.assertEqual(user, "kpugi_hq")

    def test_classify_text_and_story_posts(self):
        post_type, user, cid = classify_facebook_url("https://www.facebook.com/creator_name/posts/99887766")
        self.assertEqual(post_type, "post")
        self.assertEqual(user, "creator_name")
        self.assertEqual(cid, "99887766")

        post_type, user, cid = classify_facebook_url("https://www.facebook.com/story.php?story_fbid=112233&id=445566")
        self.assertEqual(post_type, "post")
        self.assertEqual(cid, "112233")

    def test_invalid_facebook_url(self):
        res = extract_facebook_post("https://www.facebook.com/nonexistent_fake_page_99999999/posts/00000000")
        self.assertIsInstance(res, ScrapeResult)
        self.assertEqual(res.platform, "facebook")

if __name__ == '__main__':
    unittest.main()
