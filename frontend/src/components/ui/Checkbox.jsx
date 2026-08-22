export const Checkbox = ({ checked, onChange, label, disabled = false, className = '' }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`flex size-5 shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-colors ${
      checked ? 'border-primary bg-primary-soft' : 'border-primary bg-surface hover:bg-primary-soft'
    } ${className}`}
  >
    {checked ? (
      <svg viewBox="0 0 12 10" fill="none" className="w-[11px] text-primary-deep" aria-hidden="true">
        <path
          d="M1 5.2 4.2 8.5 11 1.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ) : null}
  </button>
);
