import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout.jsx';
import { GoogleButton } from '../components/auth/GoogleButton.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Field } from '../components/ui/Field.jsx';
import { Input } from '../components/ui/Input.jsx';
import { useAuth } from '../auth/useAuth.js';
import { apiError, fieldErrors } from '../lib/api.js';

const OAUTH_MESSAGES = {
  GOOGLE_AUTH_FAILED: 'Google did not complete that sign-in. Please try again.',
  GOOGLE_EMAIL_MISSING: 'That Google account did not share an email address.',
  GOOGLE_EMAIL_UNVERIFIED:
    'An account already uses that email, and Google reports the address as unverified.',
  OAUTH_STATE_INVALID: 'That sign-in link expired. Please try again.',
};

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams] = useSearchParams();
  const oauthError = searchParams.get('error');

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(
    oauthError ? (OAUTH_MESSAGES[oauthError] ?? 'That sign-in could not be completed.') : '',
  );
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setFormError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await login(form);
      navigate(location.state?.from ?? '/home', { replace: true });
    } catch (error) {
      const { code, message } = apiError(error);

      if (code === 'ACCOUNT_DISABLED') {
        navigate('/account-deactivated', { replace: true, state: { email: form.email } });
        return;
      }

      setErrors(fieldErrors(error));
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      footer={
        <>
          New here?{' '}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Email" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            icon={Mail}
            value={form.email}
            onChange={update('email')}
            error={errors.email}
            required
          />
        </Field>

        <Field label="Password" htmlFor="password" error={errors.password}>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            icon={Lock}
            value={form.password}
            onChange={update('password')}
            error={errors.password}
            required
          />
        </Field>

        {formError ? (
          <p role="alert" className="rounded-control bg-danger-soft px-3 py-2 text-sm text-danger">
            {formError}
          </p>
        ) : null}

        <Button type="submit" fullWidth loading={submitting}>
          Sign in
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      <GoogleButton label="Sign in with Google" />
    </AuthLayout>
  );
};
