import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import logo from '../assets/sprout-wordmark.png';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json() as any;

            if (!response.ok) {
                throw new Error(data.error || 'Failed to log in');
            }

            // Check for redirect param first
            const redirectTo = searchParams.get('redirect');
            if (redirectTo) {
                navigate(redirectTo);
            } else if (data.spaces && data.spaces.length > 0) {
                navigate(`/space/${data.spaces[0].slug}`);
            } else {
                navigate('/');
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

                <form onSubmit={handleLogin} className="create-space-form">
                    <h2>Welcome Back</h2>
                    <p className="form-helper">Log in to manage your spaces</p>

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
                            {isSubmitting ? 'Logging in...' : 'Log In'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
