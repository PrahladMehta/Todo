import { useState } from 'react';
import { Users } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell.jsx';
import { UserManagementRow } from '../components/admin/UserManagementRow.jsx';
import { Button } from '../components/ui/Button.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { SearchInput } from '../components/ui/Input.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { useAdminUsers, useUserMutations } from '../hooks/useAdminUsers.js';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { useAuth } from '../auth/useAuth.js';
import { ROLES } from '../lib/roles.js';

const filterClass =
  'h-10 rounded-control border border-line bg-surface px-2.5 text-sm text-ink outline-none focus:border-primary';

const Totals = ({ users }) => {
  const totals = users.reduce(
    (acc, user) => ({
      tasks: acc.tasks + (user.stats?.totalCount ?? 0),
      open: acc.open + (user.stats?.openCount ?? 0),
      done: acc.done + (user.stats?.completedCount ?? 0),
    }),
    { tasks: 0, open: 0, done: 0 },
  );

  return (
    <p className="text-sm text-muted">
      {totals.tasks} tasks · {totals.open} open · {totals.done} completed
    </p>
  );
};

export const AdminUsers = () => {
  const { user: currentUser } = useAuth();

  const [term, setTerm] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const q = useDebouncedValue(term.trim(), 300);
  const usersQuery = useAdminUsers({ q, role, isActive: status, page, limit: 20 });
  const { assignRole, setActive } = useUserMutations();

  const users = usersQuery.data?.users ?? [];
  const meta = usersQuery.data?.meta;

  const pendingId = assignRole.variables?.id ?? setActive.variables?.id ?? null;
  const isPending = assignRole.isPending || setActive.isPending;

  const resetPage = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <AppShell showAdd={false}>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-ink">User management</h1>
          <p className="text-sm text-muted">
            Change a role or deactivate an account, and see how many tasks each person is carrying.
            Role and status changes sign that user out so their new access applies immediately.
          </p>
        </div>
        <div className="text-right">
          {meta ? (
            <p className="text-sm font-medium text-ink">
              {meta.total} {meta.total === 1 ? 'account' : 'accounts'}
            </p>
          ) : null}
          <Totals users={users} />
        </div>
      </header>

      <section className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <SearchInput
          value={term}
          onChange={(event) => resetPage(setTerm)(event.target.value)}
          placeholder="Search by name or email"
          aria-label="Search users"
        />

        <select
          aria-label="Filter by role"
          className={filterClass}
          value={role}
          onChange={(event) => resetPage(setRole)(event.target.value)}
        >
          <option value="">All roles</option>
          {ROLES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by status"
          className={filterClass}
          value={status}
          onChange={(event) => resetPage(setStatus)(event.target.value)}
        >
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Deactivated</option>
        </select>
      </section>

      <section className="overflow-hidden rounded-card border border-line bg-surface">
        <div className="hidden grid-cols-[minmax(0,1.4fr)_8rem_minmax(0,13rem)_10rem] gap-4 border-b border-line bg-canvas px-4 py-2.5 text-xs font-medium text-muted lg:grid">
          <span>Account</span>
          <span>Role</span>
          <span>Task activity</span>
          <span className="text-right">Status</span>
        </div>

        {usersQuery.isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" label="Loading accounts" />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No accounts match"
            message="Try a different search term or clear the filters."
          />
        ) : (
          <ul>
            {users.map((account) => (
              <UserManagementRow
                key={account.id}
                user={account}
                isSelf={account.id === currentUser?.id}
                pending={isPending && pendingId === account.id}
                onRoleChange={(target, nextRole) =>
                  assignRole.mutate({ id: target.id, role: nextRole })
                }
                onToggleActive={(target) =>
                  setActive.mutate({ id: target.id, isActive: !target.isActive })
                }
              />
            ))}
          </ul>
        )}
      </section>

      {meta && meta.totalPages > 1 ? (
        <nav className="mt-4 flex items-center justify-between" aria-label="Pagination">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </Button>
          <span className="text-xs text-muted">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={!meta.hasNextPage}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </nav>
      ) : null}
    </AppShell>
  );
};
