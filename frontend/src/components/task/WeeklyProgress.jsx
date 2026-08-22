import { progressPercent } from '../../lib/week.js';

export const WeeklyProgress = ({ summary }) => {
  const percent = progressPercent(summary ?? {});

  return (
    <section aria-label="Weekly progress" className="space-y-2.5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-ink">Weekly Progress</h2>
        <span className="text-xs font-medium text-muted">{percent}%</span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Tasks completed this week"
        className="h-3.5 w-full overflow-hidden rounded-[3px] bg-primary-track"
      >
        <div
          className="h-full rounded-[3px] bg-primary-deep transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </section>
  );
};
