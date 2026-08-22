export const IconButton = ({ label, className = '', children, ...props }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={`inline-flex size-9 items-center justify-center rounded-control text-muted transition-colors hover:bg-primary-soft hover:text-primary ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const iconActionClass =
  'inline-flex size-9 items-center justify-center rounded-control text-muted transition-colors hover:bg-primary-soft hover:text-primary';
