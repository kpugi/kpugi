import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const baseStyle = 'btn font-semibold transition-all';
  const variantStyle =
    variant === 'primary' ? 'btn-primary' :
    variant === 'secondary' ? 'btn-secondary' :
    variant === 'outline' ? 'btn-outline' :
    variant === 'ghost' ? 'btn-ghost' :
    'btn-error text-white';

  const sizeStyle = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : 'btn-md';

  return (
    <button className={`${baseStyle} ${variantStyle} ${sizeStyle} ${className}`} {...props}>
      {children}
    </button>
  );
}
