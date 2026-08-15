import type { ReactNode, SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  leftAddon?: ReactNode;
}

export default function Select({
  label,
  error,
  hint,
  options,
  placeholder,
  leftAddon,
  id,
  className = '',
  ...props
}: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-text">
          {label}
        </label>
      )}
      <div className="relative">
        {leftAddon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
            {leftAddon}
          </div>
        )}
        <select
          id={selectId}
          className={`block w-full appearance-none rounded-lg border bg-surface px-3 py-2 text-sm text-text shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:cursor-not-allowed disabled:bg-surface-muted ${leftAddon ? 'pl-10' : ''} ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100' : 'border-border'} ${className}`}
          aria-invalid={error ? true : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {hint && !error && (
        <p className="mt-1.5 text-xs text-text-muted">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-danger-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
