import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({
  children,
  padding = 'md',
  hoverable = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface shadow-sm ${paddingClasses[padding]} ${hoverable ? 'transition-shadow hover:shadow-md' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
