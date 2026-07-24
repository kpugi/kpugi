import React from 'react';

export function ConnectAccountButton({ platform }: { platform: 'instagram' | 'tiktok' | 'x' }) {
  return (
    <button className="btn btn-outline btn-sm capitalize">
      Connect {platform} Account
    </button>
  );
}
