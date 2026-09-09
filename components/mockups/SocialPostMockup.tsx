'use client';

import React from 'react';
import { SubmissionMockupData } from './types';
import InstagramPostMockup from './InstagramPostMockup';
import TikTokPostMockup from './TikTokPostMockup';
import YouTubePostMockup from './YouTubePostMockup';
import TwitterPostMockup from './TwitterPostMockup';
import FacebookPostMockup from './FacebookPostMockup';
import LinkedInPostMockup from './LinkedInPostMockup';
import Iphone from './Iphone';

interface Props {
  submission: SubmissionMockupData;
  onInspect?: () => void;
}

export default function SocialPostMockup({ submission, onInspect }: Props) {
  const p = (submission.platform || '').toLowerCase();

  if (p.includes('tiktok')) {
    return (
      <div
        onClick={onInspect}
        className="w-full max-w-[320px] mx-auto cursor-pointer group transition-transform duration-300 hover:scale-[1.02]"
      >
        <Iphone className="drop-shadow-2xl">
          <TikTokPostMockup data={submission} />
        </Iphone>
      </div>
    );
  }
  if (p.includes('instagram') || p.includes('ig')) {
    return (
      <div
        onClick={onInspect}
        className="w-full max-w-[320px] mx-auto cursor-pointer group transition-transform duration-300 hover:scale-[1.02]"
      >
        <Iphone className="drop-shadow-2xl">
          <InstagramPostMockup data={submission} />
        </Iphone>
      </div>
    );
  }
  if (p.includes('youtube') || p.includes('yt') || p.includes('shorts')) {
    return <YouTubePostMockup data={submission} onInspect={onInspect} />;
  }
  if (p.includes('twitter') || p.includes('x')) {
    return (
      <div
        onClick={onInspect}
        className="w-full max-w-[320px] mx-auto cursor-pointer group transition-transform duration-300 hover:scale-[1.02]"
      >
        <Iphone className="drop-shadow-2xl">
          <TwitterPostMockup data={submission} />
        </Iphone>
      </div>
    );
  }
  if (p.includes('facebook') || p.includes('fb')) {
    return <FacebookPostMockup data={submission} onInspect={onInspect} />;
  }
  if (p.includes('linkedin')) {
    return <LinkedInPostMockup data={submission} onInspect={onInspect} />;
  }

  // Fallback to Instagram style inside iPhone if unknown
  return (
    <div
      onClick={onInspect}
      className="w-full max-w-[320px] mx-auto cursor-pointer group transition-transform duration-300 hover:scale-[1.02]"
    >
      <Iphone className="drop-shadow-2xl">
        <InstagramPostMockup data={submission} />
      </Iphone>
    </div>
  );
}
