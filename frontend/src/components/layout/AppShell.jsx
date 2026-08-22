import { Link, useNavigate } from 'react-router-dom';
import { CalendarRange, LogOut, Plus, Search, Users } from 'lucide-react';
import { IconButton, iconActionClass } from '../ui/IconButton.jsx';
import { Button } from '../ui/Button.jsx';
import { useAuth } from '../../auth/useAuth.js';

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

export const AppShell = ({ children, onAddTask, showAdd = true }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const signOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-5 md:max-w-2xl lg:max-w-6xl lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
              {initials(user?.name)}
            </span>
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="text-sm font-semibold text-ink">{user?.name}</span>
              <span className="text-xs capitalize text-muted">{user?.role}</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            {showAdd ? (
              <div className="hidden lg:block">
                <Button size="sm" onClick={onAddTask}>
                  <Plus className="size-4" />
                  Add Task
                </Button>
              </div>
            ) : null}

            <Link
              to="/weeks"
              aria-label="Weekly overview"
              title="Weekly overview"
              className={iconActionClass}
            >
              <CalendarRange className="size-5" />
            </Link>

            <Link
              to="/search"
              aria-label="Search tasks"
              title="Search tasks"
              className={iconActionClass}
            >
              <Search className="size-5" />
            </Link>

            {user?.role === 'admin' ? (
              <Link
                to="/admin/users"
                aria-label="User management"
                title="User management"
                className={iconActionClass}
              >
                <Users className="size-5" />
              </Link>
            ) : null}

            <IconButton label="Sign out" onClick={signOut}>
              <LogOut className="size-5" />
            </IconButton>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-5 pt-4 pb-28 md:max-w-2xl lg:max-w-6xl lg:px-8 lg:pb-12">
        {children}
      </main>

      {showAdd ? (
        <button
          type="button"
          onClick={onAddTask}
          aria-label="Add task"
          className="fixed bottom-8 left-1/2 flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-white shadow-fab transition-colors hover:bg-primary-hover lg:hidden"
        >
          <Plus className="size-7" strokeWidth={2.2} />
        </button>
      ) : null}
    </div>
  );
};
