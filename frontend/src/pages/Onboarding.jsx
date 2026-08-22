import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import { ChevronPattern } from '../components/ui/ChevronPattern.jsx';

export const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-dvh w-full flex-col bg-surface lg:flex-row lg:items-stretch">
      <div className="relative h-[62dvh] shrink-0 overflow-hidden bg-primary lg:h-dvh lg:flex-1">
        <ChevronPattern />
      </div>

      <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-between gap-8 px-6 pt-7 pb-9 lg:mx-0 lg:max-w-xl lg:justify-center lg:px-16">
        <div className="space-y-3 lg:max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-ink lg:text-4xl">
            Manage What To Do
          </h1>
          <p className="max-w-xs text-sm leading-relaxed text-muted lg:max-w-md lg:text-base">
            The best way to manage what you have to do, don&apos;t forget your plans
          </p>
        </div>

        <div className="space-y-4 lg:max-w-sm">
          <Button fullWidth onClick={() => navigate('/signup')}>
            Get Started
          </Button>
          <p className="text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};
