import { Spinner } from './Spinner.jsx';

const base =
  'inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-60';

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-deep',
  secondary: 'bg-primary-soft text-primary hover:bg-primary-track',
  outline: 'border border-line bg-surface text-ink-soft hover:bg-primary-soft hover:text-primary',
  ghost: 'text-primary hover:bg-primary-soft',
  danger: 'bg-danger-soft text-danger hover:bg-danger hover:text-white',
};

const sizes = {
  sm: 'h-9 rounded-control px-3 text-sm',
  md: 'h-11 rounded-control px-4 text-[0.9375rem]',
  lg: 'h-13 rounded-control px-5 text-base',
};

export const Button = ({
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) => (
  <button
    className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? <Spinner size="sm" tone="current" /> : children}
  </button>
);
