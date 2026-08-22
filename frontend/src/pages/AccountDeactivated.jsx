import { Link, useLocation } from 'react-router-dom';
import { LifeBuoy, ShieldOff } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useAuth } from '../auth/useAuth.js';

export const AccountDeactivated = () => {
  const location = useLocation();
  const { clearSessionEnded } = useAuth();
  const email = location.state?.email ?? null;

  return (
    <AuthLayout
      title="This account is deactivated"
      subtitle="An administrator has turned off access for this account."
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-card border border-danger/25 bg-danger-soft px-4 py-3.5">
          <ShieldOff className="mt-0.5 size-5 shrink-0 text-danger" />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-danger">Sign-in is blocked</p>
            <p className="text-ink-soft">
              {email ? (
                <>
                  <span className="font-medium">{email}</span> cannot sign in until an administrator
                  reactivates it.
                </>
              ) : (
                'You cannot sign in until an administrator reactivates this account.'
              )}
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-muted">
          <p className="flex items-start gap-2">
            <LifeBuoy className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              Your tasks have not been deleted. Everything comes back exactly as it was once the
              account is reactivated.
            </span>
          </p>
          <p className="pl-6">
            If you think this is a mistake, ask an administrator of your workspace to turn the
            account back on.
          </p>
        </div>

        <Link to="/login" onClick={clearSessionEnded} className="block">
          <Button fullWidth variant="outline">
            Back to sign in
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
};
