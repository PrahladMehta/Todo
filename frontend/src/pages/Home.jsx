import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell.jsx';
import { SearchInput } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';
import { DayStrip } from '../components/task/DayStrip.jsx';
import { StatCards } from '../components/task/StatCards.jsx';
import { WeeklyProgress } from '../components/task/WeeklyProgress.jsx';
import { TaskList } from '../components/task/TaskList.jsx';
import { TaskFormModal } from '../components/task/TaskFormModal.jsx';
import { useTasks, useWeekSummary } from '../hooks/useTasks.js';
import { useTaskMutations } from '../hooks/useTaskMutations.js';
import { dayBounds, isCurrentDay, shortDateLabel, weekStartOf } from '../lib/week.js';

export const Home = () => {
  const [anchor, setAnchor] = useState(() => weekStartOf());
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { createTask, updateTask, toggleStatus, deleteTask } = useTaskMutations();

  const weekQuery = useWeekSummary({ weeksBack: 1, weeksAhead: 1 });

  const currentWeek = useMemo(() => {
    const target = weekStartOf(anchor).getTime();
    return (
      weekQuery.data?.weeks?.find((week) => weekStartOf(week.weekStart).getTime() === target) ?? {
        openCount: 0,
        completedCount: 0,
        totalCount: 0,
      }
    );
  }, [weekQuery.data, anchor]);

  const bounds = useMemo(() => dayBounds(selectedDay), [selectedDay]);
  const taskQuery = useTasks({ ...bounds, sort: 'dueAt', limit: 50 });

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditing(task);
    setModalOpen(true);
  };

  const submitTask = async (payload) => {
    if (editing) {
      await updateTask.mutateAsync({ id: editing._id, updates: payload });
    } else {
      await createTask.mutateAsync(payload);
    }
    setModalOpen(false);
    setEditing(null);
  };

  const listTitle = isCurrentDay(selectedDay) ? 'Tasks Today' : shortDateLabel(selectedDay);

  return (
    <AppShell onAddTask={openCreate}>
      <div className="space-y-5 lg:grid lg:grid-cols-[22rem_1fr] lg:items-start lg:gap-10 lg:space-y-0">
        <div className="space-y-5">
          <Link to="/search" className="block">
            <SearchInput placeholder="Search for a task" readOnly tabIndex={-1} />
          </Link>

          <DayStrip
            anchor={anchor}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            onAnchorChange={(next) => {
              setAnchor(next);
              setSelectedDay(next);
            }}
          />

          <StatCards
            completedCount={currentWeek.completedCount}
            openCount={currentWeek.openCount}
          />

          <WeeklyProgress summary={currentWeek} />
        </div>

        <section className="space-y-1">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-semibold text-ink">{listTitle}</h2>
            <Link to="/weeks" className="text-sm font-medium text-primary hover:underline">
              View All
            </Link>
          </div>

          <TaskList
            tasks={taskQuery.data?.tasks}
            isLoading={taskQuery.isLoading}
            isFetching={taskQuery.isFetching && !taskQuery.isLoading}
            error={taskQuery.error}
            emptyTitle="Nothing planned"
            emptyMessage="Tasks you add for this day will show up here."
            emptyAction={
              <Button size="sm" variant="secondary" onClick={openCreate}>
                Add a task
              </Button>
            }
            onToggle={(task, status) => toggleStatus.mutate({ id: task._id, status })}
            onEdit={openEdit}
            onDelete={(task) => deleteTask.mutate(task._id)}
          />
        </section>
      </div>

      {modalOpen ? (
        <TaskFormModal
          key={editing?._id ?? 'new'}
          task={editing}
          defaultDate={selectedDay}
          submitting={createTask.isPending || updateTask.isPending}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSubmit={submitTask}
        />
      ) : null}
    </AppShell>
  );
};
