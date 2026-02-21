import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logo from '../assets/sprout-wordmark.png';
import { fireConfetti } from '../lib/confetti';
import './LandingPage.css';

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
            navigate('/signup');
        }
    };

    return (
        <div className="landing-page">
            <nav className="landing-nav">
                <Link to="/">
                    <img src={logo} alt="Sprout" className="logo-img" />
                </Link>
                <div className="nav-actions">
                    {!isCheckingAuth && (
                        isLoggedIn ? (
                            <Link to="/profile" className="nav-btn">Dashboard</Link>
                        ) : (
                            <>
                                <Link to="/login" className="nav-link">Sign in</Link>
                                <Link to="/get-started" className="nav-btn">Get Started</Link>
                            </>
                        )
                    )}
                </div>
            </nav>

            <main className="hero-section">
                <div className="hero-badge">
                    ✨ The easiest way to gather user feedback
                </div>

                <h1 className="hero-title">
                    Build products people <span className="highlight-circle">actually</span> want.
                </h1>

                <p className="hero-subtitle">
                    Sprout is a simple, beautiful tool to collect, organize,
                    and prioritize features your users need. Set up your feedback space in seconds.
                </p>

                <div className="hero-cta">
                    <form onSubmit={handleCreateSpace} className="hero-form">
                        <input
                            type="text"
                            placeholder="Enter your product name..."
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className="hero-input"
                            autoFocus
                        />
                        <button type="submit" className="hero-btn" disabled={isCheckingAuth}>
                            Create your space
                        </button>
                    </form>
                </div>
            </main>

            <section className="features-section">
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">💬</div>
                        <h3 className="feature-title">Feedback Boards</h3>
                        <p className="feature-desc">
                            Give your users a dedicated place to share their ideas, requests, and feedback without cluttering your inbox.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">⬆️</div>
                        <h3 className="feature-title">Upvoting & Prioritization</h3>
                        <p className="feature-desc">
                            Let your community vote on features so you always know what to build next based on real demand.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">✨</div>
                        <h3 className="feature-title">Instant Setup</h3>
                        <p className="feature-desc">
                            No complex configurations. Create your space in seconds, start collecting feedback immediately.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
