const sizes = { sm: 'size-4 border-2', md: 'size-6 border-2', lg: 'size-9 border-[3px]' };

const tones = {
  primary: 'border-primary-track border-t-primary',
  current: 'border-white/40 border-t-white',
};

export const Spinner = ({ size = 'md', tone = 'primary', label }) => (
  <span className="inline-flex flex-col items-center gap-3">
    <span
      role="status"
      aria-label={label ?? 'Loading'}
      className={`animate-spin rounded-full ${sizes[size]} ${tones[tone]}`}
    />
    {label ? <span className="text-sm text-muted">{label}</span> : null}
  </span>
);
