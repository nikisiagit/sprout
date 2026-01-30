import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logo from '../assets/sprout-wordmark.png';
import { fireConfetti } from '../lib/confetti';

export function LandingPage() {
    const [productName, setProductName] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
    }, []);

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

    const handleCreateSpace = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productName.trim()) return;

        const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        if (isLoggedIn) {
            // User is logged in - create space directly
            try {
                const response = await fetch('/api/spaces', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: productName, slug })
                });

                if (response.ok) {
                    fireConfetti();
                    navigate(`/space/${slug}`);
                } else {
                    const data = await response.json() as any;
                    alert(data.error || 'Failed to create space');
                }
            } catch (error) {
                console.error('Failed to create space', error);
            }
        } else {
            // User not logged in - store space info and redirect to auth
            localStorage.setItem('pendingSpace', JSON.stringify({ name: productName, slug }));
            navigate('/auth');
        }
    };

    return (
        <div className="landing-container">
            <div className="landing-content">
                <div className="logo-section">
                    <div className="logo-icon">
                        <img src={logo} alt="Sprout" style={{ width: '200px', height: 'auto' }} />
                    </div>
                    <p>Community tool for product improvements</p>
                </div>

                <form onSubmit={handleCreateSpace} className="create-space-form">
                    <h2>Create your space</h2>
                    <p className="form-helper">Enter your product name to generate a feedback board</p>

                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="e.g., My Awesome App"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className="space-input"
                            autoFocus
                        />
                        <button type="submit" className="create-btn" disabled={isCheckingAuth}>
                            {isLoggedIn ? 'Create Space' : 'Continue'}
                        </button>
                    </div>
                </form>

                {!isCheckingAuth && (
                    <div className="auth-links">
                        {isLoggedIn ? (
                            <Link to="/profile" className="profile-link">Go to Profile →</Link>
                        ) : (
                            <p>Already have an account? <Link to="/login">Sign in</Link></p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
