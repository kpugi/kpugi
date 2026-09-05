import React from 'react';
import { Badge as BaseBadge, type BadgeProps } from '@/components/ui/badge';

export function Badge({ className = '', ...props }: BadgeProps) {
  return <BaseBadge className={className} {...props} />;
}

export type { BadgeProps };
export default Badge;
