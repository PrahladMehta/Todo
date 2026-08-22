import { ClipboardList } from 'lucide-react';
import { TaskRow } from './TaskRow.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';
import { Spinner } from '../ui/Spinner.jsx';

const Skeleton = () => (
  <ul className="animate-pulse">
    {[0, 1, 2].map((row) => (
      <li key={row} className="flex items-center gap-3 border-b border-line py-4 last:border-b-0">
        <span className="size-5 rounded-[5px] bg-primary-soft" />
        <span className="h-3.5 flex-1 rounded bg-primary-soft" />
      </li>
    ))}
  </ul>
);

export const TaskList = ({
  tasks,
  isLoading,
  isFetching,
  error,
  emptyTitle = 'Nothing planned',
  emptyMessage = 'Tasks you add for this day will show up here.',
  emptyAction,
  onToggle,
  onEdit,
  onDelete,
}) => {
  if (isLoading) return <Skeleton />;

  if (error) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="We could not load your tasks"
        message="Check your connection and try again."
      />
    );
  }

  if (!tasks?.length) {
    return (
      <EmptyState
        icon={ClipboardList}
        title={emptyTitle}
        message={emptyMessage}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="relative">
      {isFetching ? (
        <span className="absolute -top-6 right-0">
          <Spinner size="sm" />
        </span>
      ) : null}

      <ul>
        {tasks.map((task) => (
          <TaskRow
            key={task._id}
            task={task}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  );
};
