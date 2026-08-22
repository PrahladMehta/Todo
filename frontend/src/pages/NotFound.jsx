import { Link } from 'react-router-dom';

export const NotFound = () => (
  <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
    <p className="text-5xl font-semibold text-primary">404</p>
    <p className="font-semibold text-ink">This page does not exist</p>
    <Link to="/home" className="font-medium text-primary hover:underline">
      Go to your tasks
    </Link>
  </main>
);
