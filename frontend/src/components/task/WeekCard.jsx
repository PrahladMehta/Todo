import { ChevronDown } from 'lucide-react';
import { progressPercent } from '../../lib/week.js';

const pad = (value) => String(value ?? 0).padStart(2, '0');

const Count = ({ value, label, tone }) => (
  <div className={`flex-1 rounded-control px-3 py-2 ${tone}`}>
    <p className="text-lg font-bold text-ink">{pad(value)}</p>
    <p className="text-[0.6875rem] text-muted">{label}</p>
  </div>
);

export const WeekCard = ({ week, expanded, onToggle, children }) => {
  const percent = progressPercent(week);

  return (
    <article className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 px-4 py-4 text-left"
      >
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <p className="truncate text-[0.9375rem] font-semibold text-ink">{week.label}</p>
            {week.isCurrentWeek ? (
              <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[0.625rem] font-medium text-primary">
                This week
              </span>
            ) : null}
          </div>

          <div className="flex max-w-xs gap-2.5">
            <Count value={week.openCount} label="Open" tone="bg-danger-soft" />
            <Count value={week.completedCount} label="Completed" tone="bg-primary-soft" />
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-primary-track">
            <div
              className="h-full rounded-full bg-primary-deep transition-[width] duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <ChevronDown
          className={`size-5 shrink-0 text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded ? <div className="border-t border-line px-4 pb-2">{children}</div> : null}
    </article>
  );
};
