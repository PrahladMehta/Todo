import { Loader2, Power, PowerOff } from 'lucide-react';
import { RoleBadge, StatusPill } from './RoleBadge.jsx';
import { UserTaskStats } from './UserTaskStats.jsx';
import { ROLES } from '../../lib/roles.js';

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

const selectClass =
  'h-10 w-full rounded-control border border-line bg-surface px-2.5 text-sm text-ink outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:bg-canvas disabled:text-muted';

export const UserManagementRow = ({ user, isSelf, pending, onRoleChange, onToggleActive }) => (
  <li className="grid gap-3 border-b border-line px-4 py-4 last:border-b-0 lg:grid-cols-[minmax(0,1.4fr)_8rem_minmax(0,13rem)_10rem] lg:items-center lg:gap-4">
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
        {initials(user.name)}
      </span>
      <div className="min-w-0">
        <p className="flex items-center gap-2 truncate text-[0.9375rem] font-medium text-ink">
          {user.name}
          {isSelf ? (
            <span className="rounded-full bg-line px-1.5 py-0.5 text-[0.625rem] font-medium text-muted">
              you
            </span>
          ) : null}
        </p>
        <p className="truncate text-xs text-muted">{user.email}</p>
      </div>
    </div>

    <div className="flex items-center gap-2 lg:block">
      <span className="w-16 text-xs text-muted lg:hidden">Role</span>
      {isSelf ? (
        <RoleBadge role={user.role} />
      ) : (
        <select
          aria-label={`Role for ${user.name}`}
          className={selectClass}
          value={user.role}
          disabled={pending}
          onChange={(event) => onRoleChange(user, event.target.value)}
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      )}
    </div>

    <div className="flex items-start gap-2 lg:block">
      <span className="w-16 shrink-0 pt-1 text-xs text-muted lg:hidden">Tasks</span>
      <UserTaskStats stats={user.stats} />
    </div>

    <div className="flex items-center justify-between gap-3 lg:justify-end">
      <StatusPill isActive={user.isActive} />

      {isSelf ? null : (
        <button
          type="button"
          onClick={() => onToggleActive(user)}
          disabled={pending}
          className={`inline-flex h-9 items-center gap-1.5 rounded-control px-3 text-xs font-medium transition-colors disabled:opacity-60 ${
            user.isActive ? 'text-danger hover:bg-danger-soft' : 'text-primary hover:bg-primary-soft'
          }`}
        >
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : user.isActive ? (
            <PowerOff className="size-3.5" />
          ) : (
            <Power className="size-3.5" />
          )}
          {user.isActive ? 'Deactivate' : 'Activate'}
        </button>
      )}
    </div>
  </li>
);
