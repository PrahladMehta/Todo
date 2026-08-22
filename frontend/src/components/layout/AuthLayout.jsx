import { ChevronPattern } from '../ui/ChevronPattern.jsx';

export const AuthLayout = ({ title, subtitle, children, footer }) => (
  <main className="flex min-h-dvh flex-col lg:flex-row">
    <div className="relative hidden overflow-hidden bg-primary lg:flex lg:w-[42%] lg:flex-col lg:justify-end lg:p-14">
      <ChevronPattern />
      <div className="relative space-y-3 text-white">
        <p className="text-3xl font-semibold leading-tight">Manage What To Do</p>
        <p className="max-w-xs text-sm text-white/80">
          Plan your week, track what is open and finish what matters.
        </p>
      </div>
    </div>

    <div className="flex flex-1 items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 space-y-2">
          <div className="mb-6 flex size-11 items-center justify-center rounded-card bg-primary lg:hidden">
            <span className="text-lg font-semibold text-white">T</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
          {subtitle ? <p className="text-sm text-muted">{subtitle}</p> : null}
        </div>

        {children}

        {footer ? <div className="mt-6 text-center text-sm text-muted">{footer}</div> : null}
      </div>
    </div>
  </main>
);
