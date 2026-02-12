import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/sprout-wordmark.png';

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
        <div className="landing-container">
            <div className="landing-content">
                <div className="logo-section">
                    <Link to="/" className="logo-icon">
                        <img src={logo} alt="Sprout" style={{ width: '150px', height: 'auto' }} />
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="create-space-form">
                    <h2>Reset Password</h2>
                    <p className="form-helper">Enter your email and we'll send you a link to reset your password.</p>

                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="space-input"
                            required
                        />
                        {error && <p className="error-message">{error}</p>}
                        {message && <p className="success-message">{message}</p>}
                        <button type="submit" className="create-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </div>
                </form>

                <div className="auth-toggle">
                    <p><Link to="/login" className="link-btn">Back to Login</Link></p>
                </div>
            </div>
        </div>
    );
}
