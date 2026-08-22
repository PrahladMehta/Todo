import { Navigate, Route, Routes } from 'react-router-dom';
import { GuestRoute, ProtectedRoute } from './auth/ProtectedRoute.jsx';
import { AdminRoute } from './auth/AdminRoute.jsx';
import { Onboarding } from './pages/Onboarding.jsx';
import { Login } from './pages/Login.jsx';
import { Signup } from './pages/Signup.jsx';
import { AuthCallback } from './pages/AuthCallback.jsx';
import { AccountDeactivated } from './pages/AccountDeactivated.jsx';
import { Home } from './pages/Home.jsx';
import { Search } from './pages/Search.jsx';
import { Weeks } from './pages/Weeks.jsx';
import { AdminUsers } from './pages/AdminUsers.jsx';
import { NotFound } from './pages/NotFound.jsx';

export const App = () => (
  <Routes>
    <Route element={<GuestRoute />}>
      <Route path="/" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Route>

    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/account-deactivated" element={<AccountDeactivated />} />

    <Route element={<ProtectedRoute />}>
      <Route path="/home" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/weeks" element={<Weeks />} />
    </Route>

    <Route element={<AdminRoute />}>
      <Route path="/admin/users" element={<AdminUsers />} />
    </Route>

    <Route path="/index.html" element={<Navigate to="/" replace />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);
