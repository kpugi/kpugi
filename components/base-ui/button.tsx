import * as React from 'react';
import { Button as BaseButton, type ButtonProps } from '@/components/ui/button';

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return <BaseButton className={className} ref={ref} {...props} />;
  }
);

Button.displayName = 'Button';
export type { ButtonProps };
export default Button;
