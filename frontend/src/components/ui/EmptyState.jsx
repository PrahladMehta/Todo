export const EmptyState = ({ icon: Icon, title, message, action }) => (
  <div className="flex flex-col items-center gap-3 rounded-card px-6 py-12 text-center">
    {Icon ? (
      <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon className="size-6" />
      </span>
    ) : null}
    <p className="font-semibold text-ink">{title}</p>
    {message ? <p className="max-w-xs text-sm text-muted">{message}</p> : null}
    {action}
  </div>
);
