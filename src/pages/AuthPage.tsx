import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logo from '../assets/sprout-wordmark.png';
import { fireConfetti } from '../lib/confetti';

export function AuthPage() {
    const [mode, setMode] = useState<'signup' | 'login'>('signup');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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
                    throw new Error(errData.error || 'Failed to create space');
                }
            } else {
                // No pending space - go to profile
                navigate('/profile');
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="landing-container">
            <div className="landing-content">
                <div className="logo-section">
                    <div className="logo-icon">
                        <img src={logo} alt="Sprout" style={{ width: '150px', height: 'auto' }} />
                    </div>
                </div>

                {spaceInfo && (
                    <div className="pending-space-info">
                        <p>Creating space: <strong>{spaceInfo.name}</strong></p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="create-space-form">
                    <h2>{mode === 'signup' ? 'Create Account' : 'Welcome Back'}</h2>
                    <p className="form-helper">
                        {mode === 'signup'
                            ? 'Sign up to manage your spaces'
                            : 'Log in to your account'}
                    </p>

                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="space-input"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="space-input"
                            required
                        />
                        {error && <p className="error-message">{error}</p>}
                        <button type="submit" className="create-btn" disabled={isSubmitting}>
                            {isSubmitting
                                ? (mode === 'signup' ? 'Creating...' : 'Logging in...')
                                : (mode === 'signup' ? 'Sign Up' : 'Log In')}
                        </button>
                    </div>
                </form>

                <div className="auth-toggle">
                    {mode === 'signup' ? (
                        <p>Already have an account? <button onClick={() => setMode('login')} className="link-btn">Log in</button></p>
                    ) : (
                        <p>Don't have an account? <button onClick={() => setMode('signup')} className="link-btn">Sign up</button></p>
                    )}
                </div>
            </div>
        </div>
    );
}
