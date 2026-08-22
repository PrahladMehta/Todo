const pad = (value) => String(value ?? 0).padStart(2, '0');

const CompleteIcon = () => (
  <span className="flex size-5 shrink-0 items-center justify-center rounded-[5px] border-[1.5px] border-primary bg-surface">
    <svg viewBox="0 0 12 10" fill="none" className="w-[11px] text-primary-deep" aria-hidden="true">
      <path
        d="M1 5.2 4.2 8.5 11 1.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

const PendingIcon = () => (
  <span className="flex size-5 shrink-0 items-center justify-center rounded-[5px] border-[1.5px] border-danger bg-surface">
    <svg viewBox="0 0 10 10" fill="none" className="w-[10px] text-danger" aria-hidden="true">
      <path
        d="M1.5 1.5l7 7M8.5 1.5l-7 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  </span>
);

const Card = ({ icon, label, value, surface }) => (
  <div className={`flex flex-col gap-2.5 rounded-card px-3.5 py-3.5 ${surface}`}>
    <div className="flex items-center gap-2">
      {icon}
      <span className="truncate text-xs font-medium whitespace-nowrap text-ink-soft">{label}</span>
    </div>
    <p className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-ink">{value}</span>
      <span className="text-[0.6875rem] text-muted">This Week</span>
    </p>
  </div>
);

export const StatCards = ({ completedCount = 0, openCount = 0 }) => (
  <section aria-label="This week at a glance" className="grid grid-cols-2 gap-3.5">
    <Card
      icon={<CompleteIcon />}
      label="Task Complete"
      value={pad(completedCount)}
      surface="bg-primary-soft"
    />
    <Card
      icon={<PendingIcon />}
      label="Task Pending"
      value={pad(openCount)}
      surface="bg-danger-soft"
    />
  </section>
);
