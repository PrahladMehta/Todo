import { forwardRef } from 'react';

const shell =
  'flex h-12 w-full items-center gap-2 rounded-control border bg-surface px-3.5 transition-colors focus-within:border-primary';

export const Input = forwardRef(
  ({ icon: Icon, trailing, error, className = '', containerClassName = '', ...props }, ref) => (
    <div
      className={`${shell} ${error ? 'border-danger' : 'border-line'} ${containerClassName}`}
    >
      {Icon ? <Icon className="size-4 shrink-0 text-muted" /> : null}
      <input
        ref={ref}
        aria-invalid={error ? 'true' : undefined}
        className={`h-full w-full bg-transparent text-[0.9375rem] text-ink outline-none placeholder:text-muted ${className}`}
        {...props}
      />
      {trailing}
    </div>
  ),
);

Input.displayName = 'Input';

export const Textarea = forwardRef(({ error, className = '', ...props }, ref) => (
  <textarea
    ref={ref}
    rows={4}
    aria-invalid={error ? 'true' : undefined}
    className={`w-full resize-none rounded-control border bg-surface px-3.5 py-3 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-muted focus:border-primary ${
      error ? 'border-danger' : 'border-line'
    } ${className}`}
    {...props}
  />
));

Textarea.displayName = 'Textarea';

export const SearchInput = forwardRef(({ className = '', ...props }, ref) => (
  <div
    className={`flex h-12 w-full items-center gap-3 rounded-control border border-line bg-surface px-4 shadow-card focus-within:border-primary ${className}`}
  >
    <input
      ref={ref}
      type="search"
      className="h-full w-full bg-transparent text-[0.9375rem] text-ink outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
      {...props}
    />
    <svg viewBox="0 0 24 24" fill="none" className="size-5 shrink-0 text-ink" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  </div>
));

SearchInput.displayName = 'SearchInput';
