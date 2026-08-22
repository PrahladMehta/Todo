const tones = {
  high: { className: 'bg-danger', label: 'High priority' },
  medium: { className: 'bg-primary', label: 'Medium priority' },
  low: { className: 'bg-muted', label: 'Low priority' },
};

export const PriorityDot = ({ priority = 'medium' }) => {
  const tone = tones[priority] ?? tones.medium;

  return <span title={tone.label} aria-label={tone.label} className={`size-1.5 shrink-0 rounded-full ${tone.className}`} />;
};
