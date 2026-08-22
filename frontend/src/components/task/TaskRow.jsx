import { useRef, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Checkbox } from '../ui/Checkbox.jsx';
import { IconButton } from '../ui/IconButton.jsx';
import { PriorityDot } from './PriorityDot.jsx';
import { timeLabel } from '../../lib/week.js';

const SWIPE_THRESHOLD = 48;

export const TaskRow = ({ task, onToggle, onEdit, onDelete }) => {
  const [revealed, setRevealed] = useState(false);
  const startX = useRef(null);
  const completed = task.status === 'completed';

  const onTouchStart = (event) => {
    startX.current = event.touches[0].clientX;
  };

  const onTouchMove = (event) => {
    if (startX.current === null) return;
    const delta = event.touches[0].clientX - startX.current;
    if (delta < -SWIPE_THRESHOLD) setRevealed(true);
    if (delta > SWIPE_THRESHOLD) setRevealed(false);
  };

  const onTouchEnd = () => {
    startX.current = null;
  };

  const meta = [
    task.startAt ? `${timeLabel(task.startAt)}${task.endAt ? ` - ${timeLabel(task.endAt)}` : ''}` : null,
    task.description || null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <li className="relative overflow-hidden border-b border-line last:border-b-0">
      <button
        type="button"
        aria-label={`Delete ${task.title}`}
        onClick={() => onDelete(task)}
        className={`absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-danger text-sm font-medium text-white transition-opacity sm:hidden ${
          revealed ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        Delete
      </button>

      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`flex items-center gap-3 bg-canvas py-3.5 transition-transform duration-200 ${
          revealed ? '-translate-x-20 sm:translate-x-0' : 'translate-x-0'
        }`}
      >
        <Checkbox
          checked={completed}
          onChange={(next) => onToggle(task, next ? 'completed' : 'in_progress')}
          label={completed ? `Mark ${task.title} as in progress` : `Mark ${task.title} as complete`}
        />

        <button
          type="button"
          onClick={() => onEdit(task)}
          className="min-w-0 flex-1 text-left"
        >
          <span className="flex items-center gap-2">
            <PriorityDot priority={task.priority} />
            <span
              className={`truncate text-[0.9375rem] ${
                completed ? 'text-muted line-through' : 'text-ink'
              }`}
            >
              {task.title}
            </span>
          </span>
          {meta ? <span className="mt-0.5 block truncate text-xs text-muted">{meta}</span> : null}
        </button>

        <div className="flex shrink-0 items-center gap-0.5">
          <IconButton label={`Delete ${task.title}`} onClick={() => onDelete(task)}>
            <Trash2 className="size-4.5" />
          </IconButton>
          <IconButton label={`Edit ${task.title}`} onClick={() => onEdit(task)}>
            <Pencil className="size-4.5" />
          </IconButton>
        </div>
      </div>
    </li>
  );
};
