const Metric = ({ value, label, tone = 'text-ink' }) => (
  <span className="flex flex-col leading-tight">
    <span className={`text-sm font-semibold ${tone}`}>{String(value ?? 0).padStart(2, '0')}</span>
    <span className="text-[0.625rem] text-muted">{label}</span>
  </span>
);

export const UserTaskStats = ({ stats }) => {
  const { totalCount = 0, openCount = 0, completedCount = 0, completionRate = 0 } = stats ?? {};

  if (totalCount === 0) {
    return <p className="text-xs text-muted">No tasks yet</p>;
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-4">
        <Metric value={totalCount} label="Tasks" />
        <Metric value={openCount} label="Open" tone="text-danger" />
        <Metric value={completedCount} label="Done" tone="text-primary" />
      </div>

      <div className="flex items-center gap-2">
        <span
          role="progressbar"
          aria-valuenow={completionRate}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Completion rate"
          className="h-1.5 w-full max-w-32 overflow-hidden rounded-full bg-primary-track"
        >
          <span
            className="block h-full rounded-full bg-primary-deep"
            style={{ width: `${completionRate}%` }}
          />
        </span>
        <span className="text-[0.625rem] font-medium text-muted">{completionRate}%</span>
      </div>
    </div>
  );
};
