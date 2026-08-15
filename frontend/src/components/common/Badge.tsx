type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface-muted text-text-muted border-border',
  primary: 'bg-primary-50 text-primary-700 border-primary-200',
  success: 'bg-accent-50 text-accent-700 border-accent-100',
  warning: 'bg-warning-50 text-warning-500 border-warning-500/20',
  danger: 'bg-danger-50 text-danger-600 border-danger-500/20',
};

export default function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
