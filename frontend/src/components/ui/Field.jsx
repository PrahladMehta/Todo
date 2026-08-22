export const Field = ({ label, htmlFor, error, hint, children, className = '' }) => (
  <div className={`space-y-1.5 ${className}`}>
    {label ? (
      <label htmlFor={htmlFor} className="block text-xs font-medium text-muted">
        {label}
      </label>
    ) : null}
    {children}
    {error ? (
      <p id={`${htmlFor}-error`} className="text-xs text-danger">
        {error}
      </p>
    ) : null}
    {!error && hint ? <p className="text-xs text-muted">{hint}</p> : null}
  </div>
);
