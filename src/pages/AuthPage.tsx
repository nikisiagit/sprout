import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { fireConfetti } from '../lib/confetti';

interface AuthPageProps {
    initialMode?: 'signup' | 'login';
}

export function AuthPage({ initialMode = 'signup' }: AuthPageProps) {
    const [mode, setMode] = useState<'signup' | 'login'>(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const pendingSpace = localStorage.getItem('pendingSpace');
    const spaceInfo = pendingSpace ? JSON.parse(pendingSpace) : null;

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
        <div className="govuk-width-container">
            <main className="govuk-main-wrapper" id="main-content" role="main">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        {error && (
                            <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1}>
                                <h2 className="govuk-error-summary__title" id="error-summary-title">
                                    There is a problem
                                </h2>
                                <div className="govuk-error-summary__body">
                                    <ul className="govuk-list govuk-error-summary__list">
                                        <li>
                                            <a href="#email">{error}</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        <h1 className="govuk-heading-xl">
                            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
                        </h1>

                        {spaceInfo && (
                            <div className="govuk-inset-text">
                                Creating space: <strong>{spaceInfo.name}</strong>
                            </div>
                        )}

                        <p className="govuk-body-l">
                            {mode === 'signup'
                                ? 'Sign up to manage your spaces'
                                : 'Log in to your account'}
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div className={`govuk-form-group ${error ? 'govuk-form-group--error' : ''}`}>
                                <label className="govuk-label" htmlFor="email">
                                    Email address
                                </label>
                                <input
                                    className={`govuk-input ${error ? 'govuk-input--error' : ''}`}
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="govuk-form-group">
                                <label className="govuk-label" htmlFor="password">
                                    Password
                                </label>
                                <input
                                    className="govuk-input"
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="govuk-button" disabled={isSubmitting}>
                                {isSubmitting
                                    ? (mode === 'signup' ? 'Creating...' : 'Logging in...')
                                    : (mode === 'signup' ? 'Sign Up' : 'Log In')}
                            </button>
                        </form>

                        <div className="govuk-body">
                            {mode === 'signup' ? (
                                <p>Already have an account? <button onClick={() => setMode('login')} className="govuk-link" style={{ background: 'none', border: 'none', padding: 0, fontSize: 'inherit', fontFamily: 'inherit', cursor: 'pointer' }}>Log in</button></p>
                            ) : (
                                <p>Don't have an account? <button onClick={() => setMode('signup')} className="govuk-link" style={{ background: 'none', border: 'none', padding: 0, fontSize: 'inherit', fontFamily: 'inherit', cursor: 'pointer' }}>Sign up</button></p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
