import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/sprout-wordmark.png';
import './AuthPage.css';

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json() as any;
            if (!response.ok) throw new Error(data.error || 'Something went wrong');

            setMessage(data.message);
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
                <h2 className="auth-title">Reset Password</h2>
                <p className="auth-subtitle">Enter your email and we'll send you a link to reset your password.</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="auth-input"
                        required
                    />
                    {error && <p className="error-message">{error}</p>}
                    {message && <p className="success-message">{message}</p>}
                    <button type="submit" className="auth-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="auth-footer" style={{ marginTop: '2rem' }}>
                    <p><Link to="/login" className="auth-link">Back to Login</Link></p>
                </div>
            </div>
        </div>
    );
}
