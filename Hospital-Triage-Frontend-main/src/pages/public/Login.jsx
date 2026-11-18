import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

const dashboardPaths = {
  PATIENT: '/patient/dashboard',
  DOCTOR: '/doctor/dashboard',
  RECEPTIONIST: '/receptionist/dashboard',
  ADMIN: '/admin/dashboard',
};

export function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.registeredEmail || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const { user } = await login({ email, password });
      const intendedPath = location.state?.from;
      const rolePrefix = `/${String(user.role || '').toLowerCase()}/`;
      const destination = intendedPath?.pathname?.startsWith(rolePrefix)
        ? `${intendedPath.pathname}${intendedPath.search || ''}${intendedPath.hash || ''}`
        : dashboardPaths[user.role] || '/';
      navigate(destination, { replace: true });
    } catch (loginError) {
      setError(loginError.message || 'Sign in failed. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="double-bezel-outer">
        <div className="double-bezel-inner bg-surface space-y-5">
          <div className="pb-3 border-b border-border/70">
            <span className="eyebrow-tag mb-2">Secure Sign In</span>
            <h1 className="text-2xl font-display font-bold text-ink">Welcome back</h1>
            <p className="text-xs text-ink-muted mt-1">
              Sign in with your registered email and password.
            </p>
          </div>

          {location.state?.registrationComplete && (
            <div role="status" className="p-3 rounded-xl bg-primary-light border border-primary/20 text-xs text-primary">
              Account created. Sign in with your new email and password.
            </div>
          )}

          {error && (
            <div role="alert" className="p-3 rounded-xl bg-alert-light border border-alert-border text-xs text-alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full"
              trailingIcon
            >
              Sign In
            </Button>
          </form>

          <div className="pt-3 border-t border-border/60 text-center text-xs text-ink-muted">
            New patient?{' '}
            <Link to="/register" state={location.state} className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
