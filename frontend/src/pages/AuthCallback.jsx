import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Spinner } from '../components/ui/Spinner.jsx';
import { useAuth } from '../auth/useAuth.js';

export const AuthCallback = () => {
  const { completeOAuth } = useAuth();
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    completeOAuth()
      .then(() => navigate('/home', { replace: true }))
      .catch(() => setFailed(true));
  }, [completeOAuth, navigate]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      {failed ? (
        <>
          <p className="font-semibold text-ink">We could not complete that sign-in</p>
          <p className="max-w-sm text-sm text-muted">
            The sign-in link may have expired. Please try again.
          </p>
          <Link to="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </>
      ) : (
        <Spinner size="lg" label="Finishing sign-in" />
      )}
    </main>
  );
};
