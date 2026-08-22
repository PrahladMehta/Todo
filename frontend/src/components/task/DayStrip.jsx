import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IconButton } from '../ui/IconButton.jsx';
import { dayLabel, dayNumber, isCurrentDay, isSelectedDay, shiftWeek, weekDays, weekRangeLabel } from '../../lib/week.js';

export const DayStrip = ({ anchor, selectedDay, onSelectDay, onAnchorChange }) => {
  const days = weekDays(anchor);

  return (
    <section aria-label="Days of the week" className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-soft">{weekRangeLabel(anchor)}</p>
        <div className="flex items-center gap-0.5">
          <IconButton label="Previous week" onClick={() => onAnchorChange(shiftWeek(anchor, -1))}>
            <ChevronLeft className="size-4" />
          </IconButton>
          <IconButton label="Next week" onClick={() => onAnchorChange(shiftWeek(anchor, 1))}>
            <ChevronRight className="size-4" />
          </IconButton>
        </div>
      </div>

      <div className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-1 overflow-x-auto px-1 pb-1">
        {days.map((day) => {
          const selected = isSelectedDay(day, selectedDay);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDay(day)}
              aria-current={selected ? 'date' : undefined}
              className={`flex min-w-11 flex-1 shrink-0 snap-start flex-col items-center gap-1 rounded-control px-2 py-2 transition-colors ${
                selected ? 'bg-primary text-white' : 'text-muted hover:bg-primary-soft'
              }`}
            >
              <span className="text-[0.6875rem] font-medium">{dayLabel(day)}</span>
              <span
                className={`text-sm font-semibold ${selected ? 'text-white' : 'text-ink-soft'}`}
              >
                {dayNumber(day)}
              </span>
              <span
                className={`size-1 rounded-full ${
                  selected ? 'bg-white' : isCurrentDay(day) ? 'bg-primary' : 'bg-transparent'
                }`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
};
