import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import Icon from '../components/ui/Icon';

const SECURITY_FEATURES = [
  { icon: 'lock', label: 'AES-256' },
  { icon: 'phonelink_lock', label: 'MFA ready' },
  { icon: 'verified_user', label: 'HIPAA' },
];

/** Rough strength meter — guidance for the user, never a substitute for server validation. */
function passwordStrength(password) {
  if (!password) return { score: 0, label: 'Empty', tone: 'bg-outline-variant' };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return { score, label: 'Weak', tone: 'bg-thymine-crimson' };
  if (score === 3) return { score, label: 'Fair', tone: 'bg-guanine-amber' };
  if (score === 4) return { score, label: 'Strong', tone: 'bg-cytosine-azure' };
  return { score, label: 'Excellent', tone: 'bg-adenine-emerald' };
}

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await authService.register(
        formData.username,
        formData.email,
        formData.password
      );

      if (result.success) {
        navigate('/login', {
          state: {
            message: 'Registration successful! Please log in.'
          }
        });
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength(formData.password);
  const mismatch =
    formData.confirmPassword.length > 0 && formData.confirmPassword !== formData.password;

  return (
    <div className="glass-panel rounded-card p-6 sm:p-8">
      <header>
        <p className="font-label-caps text-label-caps uppercase text-secondary">New researcher</p>
        <h1 className="mt-2 font-headline-lg text-2xl tracking-tight text-on-surface">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Start exploring your genomic data securely.
        </p>
      </header>

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
            className="input-field"
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block font-label-caps text-label-caps uppercase text-on-surface-variant"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="input-field"
            placeholder="you@example.com"
            value={formData.email}
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
              autoComplete="new-password"
              required
              className="input-field pr-12"
              placeholder="Minimum 8 characters"
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

          {formData.password && (
            <div className="mt-2 flex items-center gap-3">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i < strength.score ? strength.tone : 'bg-surface-container-highest'
                    }`}
                  />
                ))}
              </div>
              <span className="font-code-mono text-[10px] uppercase text-on-surface-variant">
                {strength.label}
              </span>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block font-label-caps text-label-caps uppercase text-on-surface-variant"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            aria-invalid={mismatch}
            className={`input-field ${mismatch ? '!border-error' : ''}`}
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {mismatch && (
            <p className="mt-2 font-code-mono text-[11px] text-error">Passwords do not match</p>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm leading-relaxed text-error"
          >
            <Icon name="error" size={18} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <p className="flex items-start gap-2 rounded-lg border border-glass-border bg-white/[0.03] px-4 py-3 font-code-mono text-[11px] leading-relaxed text-on-surface-variant">
          <Icon name="shield_lock" size={16} className="mt-0.5 shrink-0 text-cytosine-azure" />
          Your data is encrypted with AES-256 and stored securely. We comply with HIPAA and GDPR.
        </p>

        <button type="submit" disabled={loading} className="btn-primary btn-scan w-full">
          {loading ? (
            <>
              <Icon name="progress_activity" size={18} className="animate-spin" />
              Creating account
            </>
          ) : (
            <>
              <Icon name="person_add" size={18} />
              Create account
            </>
          )}
        </button>

        <p className="text-center text-sm text-on-surface-variant">
          Already have an account?{' '}
          <Link to="/login" className="text-secondary transition-colors hover:text-secondary-fixed">
            Sign in
          </Link>
        </p>
      </form>

      <div className="mt-8">
        <div className="relative flex items-center">
          <span className="h-px flex-1 bg-glass-border" />
          <span className="px-3 font-label-caps text-[10px] uppercase tracking-[0.16em] text-on-surface-variant/60">
            Security
          </span>
          <span className="h-px flex-1 bg-glass-border" />
        </div>

        <ul className="mt-4 grid grid-cols-3 gap-2">
          {SECURITY_FEATURES.map((feature) => (
            <li
              key={feature.label}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-glass-border bg-white/[0.02] py-3"
            >
              <Icon name={feature.icon} size={22} className="text-secondary" />
              <span className="font-code-mono text-[10px] text-on-surface-variant">
                {feature.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
