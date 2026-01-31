import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
            navigate('/signup');
        }
    };

    return (
        <div className="govuk-width-container">
            <main className="govuk-main-wrapper" id="main-content" role="main">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        <h1 className="govuk-heading-xl">
                            {productName || "Sprout"}
                        </h1>
                        <p className="govuk-body-l">
                            Community tool for product improvements
                        </p>

                        <form onSubmit={handleCreateSpace} className="govuk-form-group">
                            <h2 className="govuk-heading-m">Create your space</h2>
                            <div className="govuk-hint">
                                Enter your product name to generate a feedback board
                            </div>

                            <div className="govuk-form-group">
                                <label className="govuk-label" htmlFor="product-name">
                                    Product Name
                                </label>
                                <input
                                    className="govuk-input govuk-!-width-two-thirds"
                                    id="product-name"
                                    name="productName"
                                    type="text"
                                    placeholder="e.g., My Awesome App"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <button type="submit" className="govuk-button govuk-button--start" disabled={isCheckingAuth}>
                                {isLoggedIn ? 'Create Space' : 'Continue'}
                                <svg className="govuk-button__start-icon" xmlns="http://www.w3.org/2000/svg" width="17.5" height="19" viewBox="0 0 33 40" aria-hidden="true" focusable="false">
                                    <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z" />
                                </svg>
                            </button>
                        </form>

                        {!isCheckingAuth && (
                            <div className="govuk-body">
                                {isLoggedIn ? (
                                    <Link to="/profile" className="govuk-link">Go to Profile →</Link>
                                ) : (
                                    <p>Already have an account? <Link to="/login" className="govuk-link">Sign in</Link></p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
