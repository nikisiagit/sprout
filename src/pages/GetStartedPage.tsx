import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/sprout-wordmark.png';
import './AuthPage.css'; // We can reuse these nice centered styles

export function GetStartedPage() {
    const [productName, setProductName] = useState('');
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const data = await response.json() as any;
                    setIsLoggedIn(data.authenticated);
                }
            } catch (e) {
                console.error('Auth check failed', e);
            } finally {
                setIsCheckingAuth(false);
            }
        };
        checkAuth();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productName.trim()) return;

        const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        if (isLoggedIn) {
            // If already logged in, let's redirect them to the home page or try to create it directly
            try {
                const response = await fetch('/api/spaces', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: productName, slug })
                });

                if (response.ok) {
                    navigate(`/space/${slug}`);
                } else {
                    const data = await response.json() as any;
                    alert(data.error || 'Failed to create space');
                }
            } catch (error) {
                console.error('Failed to create space', error);
            }
        } else {
            // Not logged in -> save pending space and go to signup
            localStorage.setItem('pendingSpace', JSON.stringify({ name: productName, slug }));
            navigate('/signup');
        }
    };

    return (
        <div className="auth-page">
            <nav className="auth-nav">
                <Link to="/">
                    <img src={logo} alt="Sprout" className="logo-img" />
                </Link>
            </nav>

            <div className="auth-card" style={{ maxWidth: '500px' }}>
                <h2 className="auth-title">Let's build something great.</h2>
                <p className="auth-subtitle">
                    What is the name of your product or space?
                </p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="text"
                        placeholder="e.g., My Awesome App"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="auth-input"
                        autoFocus
                    />
                    <button type="submit" className="auth-btn" disabled={isCheckingAuth || !productName.trim()}>
                        Continue
                    </button>
                </form>

                <div className="auth-footer" style={{ marginTop: '2rem' }}>
                    <p>
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
