import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logo from '../assets/sprout-wordmark.png';
import { fireConfetti } from '../lib/confetti';
import './AuthPage.css';

interface AuthPageProps {
    initialMode?: 'signup' | 'login';
}

export function AuthPage({ initialMode = 'signup' }: AuthPageProps) {
    const [mode, setMode] = useState<'signup' | 'login'>(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const pendingSpace = localStorage.getItem('pendingSpace');
    const spaceInfo = pendingSpace ? JSON.parse(pendingSpace) : null;

    useEffect(() => {
        if (searchParams.get('verified') === 'true') {
            setSuccessMessage('Email verified successfully! You can now log in.');
        }
    }, [searchParams]);

    useEffect(() => {
        // Initialize Google Sign-In
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse,
            });
            window.google.accounts.id.renderButton(
                document.getElementById("google-signin-button"),
                { theme: "outline", size: "large", width: "100%" }
            );
        }
    }, []);

    const handleGoogleResponse = async (response: any) => {
        setIsSubmitting(true);
        setError('');
        try {
            const res = await fetch('/api/auth/google-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential })
            });

            const data = await res.json() as any;
            if (!res.ok) throw new Error(data.error || 'Google login failed');

            // Handle success (similar to regular login)
            if (spaceInfo) {
                const createRes = await fetch('/api/spaces', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: spaceInfo.name, slug: spaceInfo.slug })
                });
                if (createRes.ok) {
                    fireConfetti();
                    localStorage.removeItem('pendingSpace');
                    navigate(`/space/${spaceInfo.slug}`);
                    return;
                }
            }

            navigate('/profile');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';

        const body = mode === 'signup' && spaceInfo
            ? { email, password, spaceName: spaceInfo.name, spaceSlug: spaceInfo.slug }
            : { email, password };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json() as any;

            if (!response.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            // Success!
            if (mode === 'signup' && spaceInfo) {
                fireConfetti();
                localStorage.removeItem('pendingSpace');
                navigate(`/space/${spaceInfo.slug}`);
            } else if (mode === 'login' && spaceInfo) {
                // User logged in with pending space - create it now
                const createRes = await fetch('/api/spaces', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: spaceInfo.name, slug: spaceInfo.slug })
                });

                if (createRes.ok) {
                    fireConfetti();
                    localStorage.removeItem('pendingSpace');
                    navigate(`/space/${spaceInfo.slug}`);
                } else {
                    const errData = await createRes.json() as any;
                    // If space already exists or failed, just go to profile or the existing space?
                    // For now, let's treat it as an error to show the user
                    throw new Error(errData.error || 'Failed to create space');
                }
            } else {
                // No pending space
                const redirectTo = searchParams.get('redirect');
                if (redirectTo) {
                    navigate(redirectTo);
                } else {
                    navigate('/profile');
                }
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <nav className="auth-nav">
                <Link to="/">
                    <img src={logo} alt="Sprout" className="logo-img" />
                </Link>
            </nav>

            <div className="auth-card">
                {spaceInfo && (
                    <div className="pending-space-badge">
                        ✨ Creating space: {spaceInfo.name}
                    </div>
                )}

                <h2 className="auth-title">{mode === 'signup' ? 'Create Account' : 'Welcome Back'}</h2>
                <p className="auth-subtitle">
                    {mode === 'signup'
                        ? 'Sign up to manage your spaces'
                        : 'Log in to your account'}
                </p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="auth-input"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="auth-input"
                        required
                    />
                    {error && <p className="error-message">{error}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}
                    <button type="submit" className="auth-btn" disabled={isSubmitting}>
                        {isSubmitting
                            ? (mode === 'signup' ? 'Creating...' : 'Logging in...')
                            : (mode === 'signup' ? 'Sign Up' : 'Log In')}
                    </button>
                </form>

                {mode === 'login' && (
                    <div style={{ marginTop: '1rem' }}>
                        <Link to="/forgot-password" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            Forgot password?
                        </Link>
                    </div>
                )}

                <div className="auth-divider">OR</div>

                <div id="google-signin-button" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>

                <div className="auth-footer">
                    {mode === 'signup' ? (
                        <p>
                            Already have an account?{' '}
                            <button onClick={() => setMode('login')} className="auth-link">Log in</button>
                        </p>
                    ) : (
                        <p>
                            Don't have an account?{' '}
                            <button onClick={() => setMode('signup')} className="auth-link">Sign up</button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
