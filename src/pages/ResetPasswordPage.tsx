import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import logo from '../assets/sprout-wordmark.png';
import './AuthPage.css';

export function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (!token) {
            setError("Invalid or missing reset token");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await response.json() as any;
            if (!response.ok) throw new Error(data.error || 'Failed to reset password');

            setMessage(data.message);
            setTimeout(() => navigate('/login'), 2000);
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
                <h2 className="auth-title">New Password</h2>
                <p className="auth-subtitle">Enter your new password below.</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="password"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="auth-input"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="auth-input"
                        required
                    />
                    {error && <p className="error-message">{error}</p>}
                    {message && <p className="success-message">{message}</p>}
                    <button type="submit" className="auth-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
