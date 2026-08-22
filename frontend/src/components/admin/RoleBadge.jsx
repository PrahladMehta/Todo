const tones = {
  admin: 'bg-primary text-white',
  user: 'bg-line text-ink-soft',
};

export const RoleBadge = ({ role }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6875rem] font-medium capitalize ${
      tones[role] ?? tones.user
    }`}
  >
    {role}
  </span>
);

export const StatusPill = ({ isActive }) => (
  <span
    className={`inline-flex items-center gap-1.5 text-xs font-medium ${
      isActive ? 'text-ink-soft' : 'text-danger'
    }`}
  >
    <span className={`size-1.5 rounded-full ${isActive ? 'bg-primary' : 'bg-danger'}`} />
    {isActive ? 'Active' : 'Deactivated'}
  </span>
);
