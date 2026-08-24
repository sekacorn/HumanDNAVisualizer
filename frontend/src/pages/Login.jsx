import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import Icon from '../components/ui/Icon';
import { MOCK_ENABLED } from '../mocks/mockApi';
import { DEMO_USERS } from '../mocks/fixtures';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    totpCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.login(
        formData.username,
        formData.password,
        mfaRequired ? formData.totpCode : null
      );

      if (result.success) {
        navigate('/explore');
      } else if (result.mfaRequired) {
        setMfaRequired(true);
        setError('Please enter your 6-digit authentication code');
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-card p-6 sm:p-8">
      <header>
        <p className="font-label-caps text-label-caps uppercase text-secondary">Secure access</p>
        <h1 className="mt-2 font-headline-lg text-2xl tracking-tight text-on-surface">
          Sign in to your lab
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Explore your genomic data with enterprise-grade security.
        </p>
      </header>

      {MOCK_ENABLED && (
        <section className="mt-6 rounded-card border border-cytosine-azure/30 bg-cytosine-azure/[0.06] p-4">
          <h2 className="flex items-center gap-2 font-label-caps text-label-caps uppercase text-cytosine-azure">
            <Icon name="science" size={16} />
            Demo accounts
          </h2>
          <p className="mt-2 font-code-mono text-[11px] leading-relaxed text-on-surface-variant">
            No backend needed — pick an account to sign in with mock data.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DEMO_USERS.map((u) => (
              <button
                key={u.username}
                type="button"
                onClick={() => setFormData({ username: u.username, password: u.password, totpCode: '' })}
                className="rounded-full border border-glass-border bg-white/[0.04] px-3 py-2 font-code-mono text-[11px] text-on-surface-variant transition-colors hover:border-secondary/40 hover:text-secondary"
              >
                {u.username} / {u.password}
              </button>
            ))}
          </div>
        </section>
      )}

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="username"
            className="mb-2 block font-label-caps text-label-caps uppercase text-on-surface-variant"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            disabled={mfaRequired}
            className="input-field disabled:opacity-50"
            placeholder="researcher"
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block font-label-caps text-label-caps uppercase text-on-surface-variant"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              disabled={mfaRequired}
              className="input-field pr-12 disabled:opacity-50"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-on-surface"
            >
              <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={20} />
            </button>
          </div>
        </div>

        {mfaRequired && (
          <div className="animate-fade-up">
            <label
              htmlFor="totpCode"
              className="mb-2 block font-label-caps text-label-caps uppercase text-guanine-amber"
            >
              Authentication code
            </label>
            <input
              id="totpCode"
              name="totpCode"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength="6"
              className="input-field text-center !text-lg !tracking-[0.5em]"
              placeholder="000000"
              value={formData.totpCode}
              onChange={handleChange}
            />
            <p className="mt-2 font-code-mono text-[11px] text-on-surface-variant">
              6-digit code from your authenticator app
            </p>
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm leading-relaxed text-error"
          >
            <Icon name="error" size={18} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary btn-scan w-full">
          {loading ? (
            <>
              <Icon name="progress_activity" size={18} className="animate-spin" />
              Signing in
            </>
          ) : (
            <>
              <Icon name="login" size={18} />
              Sign in
            </>
          )}
        </button>

        <p className="text-center text-sm text-on-surface-variant">
          No account yet?{' '}
          <Link to="/register" className="text-secondary transition-colors hover:text-secondary-fixed">
            Create one
          </Link>
        </p>
      </form>

      {/* Enterprise SSO */}
      <div className="mt-8">
        <div className="relative flex items-center">
          <span className="h-px flex-1 bg-glass-border" />
          <span className="px-3 font-label-caps text-[10px] uppercase tracking-[0.16em] text-on-surface-variant/60">
            Enterprise SSO
          </span>
          <span className="h-px flex-1 bg-glass-border" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {['Google', 'Azure AD'].map((provider) => (
            <button key={provider} type="button" className="btn-ghost justify-center !py-3">
              {provider}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-8 flex items-center justify-center gap-2 text-center font-code-mono text-[11px] text-on-surface-variant/70">
        <Icon name="verified_user" size={16} className="shrink-0 text-secondary" />
        AES-256 encrypted · MFA protected · HIPAA compliant
      </p>
    </div>
  );
}
