import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, SearchX } from 'lucide-react';
import { SearchInput } from '../components/ui/Input.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { TaskList } from '../components/task/TaskList.jsx';
import { TaskFormModal } from '../components/task/TaskFormModal.jsx';
import { iconActionClass } from '../components/ui/IconButton.jsx';
import { useTasks } from '../hooks/useTasks.js';
import { useTaskMutations } from '../hooks/useTaskMutations.js';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';

export const Search = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [term, setTerm] = useState('');
  const [editing, setEditing] = useState(null);
  const debounced = useDebouncedValue(term.trim(), 300);

  const { updateTask, toggleStatus, deleteTask } = useTaskMutations();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const query = useTasks(
    { q: debounced, limit: 50, sort: 'dueAt' },
    { enabled: debounced.length > 0, placeholderData: (previous) => previous },
  );

  const submitEdit = async (payload) => {
    await updateTask.mutateAsync({ id: editing._id, updates: payload });
    setEditing(null);
  };

  return (
    <div className="min-h-dvh bg-canvas">
      <div className="mx-auto w-full max-w-md px-5 pt-6 pb-16 md:max-w-2xl lg:max-w-3xl lg:px-8">
        <div className="mb-5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className={iconActionClass}
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-base font-semibold text-ink">Search</h1>
        </div>

        <SearchInput
          ref={inputRef}
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search by title or description"
          aria-label="Search tasks"
        />

        <div className="mt-5">
          {debounced.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Find any task"
              message="Type a keyword to search across your task titles and descriptions."
            />
          ) : (
            <>
              {query.data?.meta ? (
                <p className="mb-1 text-xs text-muted" aria-live="polite">
                  {query.data.meta.total} {query.data.meta.total === 1 ? 'result' : 'results'} for
                  &quot;{debounced}&quot;
                </p>
              ) : null}

              <TaskList
                tasks={query.data?.tasks}
                isLoading={query.isLoading}
                isFetching={query.isFetching && !query.isLoading}
                error={query.error}
                emptyTitle="No matches"
                emptyMessage={`Nothing matched "${debounced}". Try a different keyword.`}
                onToggle={(task, status) => toggleStatus.mutate({ id: task._id, status })}
                onEdit={setEditing}
                onDelete={(task) => deleteTask.mutate(task._id)}
              />
            </>
          )}
        </div>
      </div>

      {editing ? (
        <TaskFormModal
          key={editing._id}
          task={editing}
          submitting={updateTask.isPending}
          onClose={() => setEditing(null)}
          onSubmit={submitEdit}
        />
      ) : null}
    </div>
  );
};
