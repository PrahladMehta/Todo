import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarRange } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell.jsx';
import { WeekCard } from '../components/task/WeekCard.jsx';
import { TaskList } from '../components/task/TaskList.jsx';
import { TaskFormModal } from '../components/task/TaskFormModal.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { iconActionClass } from '../components/ui/IconButton.jsx';
import { useTasks, useWeekSummary } from '../hooks/useTasks.js';
import { useTaskMutations } from '../hooks/useTaskMutations.js';

const WeekTasks = ({ weekStart, onEdit, onToggle, onDelete }) => {
  const query = useTasks({ weekStart, limit: 50, sort: 'dueAt' });

  return (
    <TaskList
      tasks={query.data?.tasks}
      isLoading={query.isLoading}
      isFetching={query.isFetching && !query.isLoading}
      error={query.error}
      emptyTitle="No tasks this week"
      emptyMessage="This week is clear."
      onToggle={onToggle}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export const Weeks = () => {
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(null);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const { createTask, updateTask, toggleStatus, deleteTask } = useTaskMutations();
  const weekQuery = useWeekSummary({ weeksBack: 8, weeksAhead: 8 });

  const weeks = weekQuery.data?.weeks ?? [];

  const submit = async (payload) => {
    if (editing) {
      await updateTask.mutateAsync({ id: editing._id, updates: payload });
      setEditing(null);
      return;
    }
    await createTask.mutateAsync(payload);
    setCreating(false);
  };

  return (
    <AppShell onAddTask={() => setCreating(true)}>
      <header className="mb-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className={iconActionClass}
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-xl font-semibold text-ink">Your weeks</h1>
        </div>
        <p className="mt-1 text-sm text-muted">
          Weeks run Monday to Sunday. Tap a card to see everything in that week.
        </p>
      </header>

      {weekQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" label="Loading your weeks" />
        </div>
      ) : weeks.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="No tasks yet"
          message="Once you add tasks they will be grouped into weekly cards here."
        />
      ) : (
        <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3">
          {weeks.map((week) => {
            const key = String(week.weekStart);
            const isOpen = expanded === key;

            return (
              <div key={key} className={isOpen ? 'md:col-span-2 lg:col-span-3' : ''}>
                <WeekCard
                  week={week}
                  expanded={isOpen}
                  onToggle={() => setExpanded(isOpen ? null : key)}
                >
                  <WeekTasks
                    weekStart={key}
                    onEdit={setEditing}
                    onToggle={(task, status) => toggleStatus.mutate({ id: task._id, status })}
                    onDelete={(task) => deleteTask.mutate(task._id)}
                  />
                </WeekCard>
              </div>
            );
          })}
        </div>
      )}

      {creating || editing ? (
        <TaskFormModal
          key={editing?._id ?? 'new'}
          task={editing}
          submitting={createTask.isPending || updateTask.isPending}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSubmit={submit}
        />
      ) : null}
    </AppShell>
  );
};
