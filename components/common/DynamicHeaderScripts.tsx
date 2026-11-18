import React from 'react';
import { CustomHeaderScript } from '@/lib/admin/platform-settings-types';

interface DynamicHeaderScriptsProps {
  scripts?: CustomHeaderScript[];
  placement: 'head' | 'body_start' | 'body_end';
}

export function DynamicHeaderScripts({ scripts, placement }: DynamicHeaderScriptsProps) {
  if (!scripts || scripts.length === 0) return null;

  const active = scripts.filter((s) => s.enabled && s.placement === placement && s.code?.trim());
  if (active.length === 0) return null;

  return (
    <>
      {active.map((item) => (
        <div
          key={item.id}
          id={`custom-script-${item.id}`}
          dangerouslySetInnerHTML={{ __html: item.code }}
          style={{ display: 'contents' }}
        />
      ))}
    </>
  );
}
