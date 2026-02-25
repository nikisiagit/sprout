import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Footer } from '../components/Footer';
import logo from '../assets/sprout-wordmark.png';
import './PricingPage.css';

export function PricingPage() {
    const [showWaitlist, setShowWaitlist] = useState(false);
    const [waitlistEmail, setWaitlistEmail] = useState('');
    const [isWaitlistSubmitting, setIsWaitlistSubmitting] = useState(false);
    const [waitlistMessage, setWaitlistMessage] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleWaitlistSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsWaitlistSubmitting(true);
        setWaitlistMessage('');
        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: waitlistEmail })
            });
            if (res.ok) {
                setWaitlistMessage("Thanks! We'll keep you posted.");
                setWaitlistEmail('');
            } else {
                setWaitlistMessage('Failed to join. Please try again.');
            }
        } catch (error) {
            setWaitlistMessage('An error occurred.');
        } finally {
            setIsWaitlistSubmitting(false);
        }
    };

    return (
        <div className="pricing-page">
            <nav className="landing-nav">
                <Link to="/">
                    <img src={logo} alt="Sprout" className="logo-img" />
                </Link>

                {/* Mobile Menu Toggle Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <div className={`nav-actions ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    <Link to="/pricing" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
                    <Link to="/login" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Sign in</Link>
                    <Link to="/get-started" className="nav-btn" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
                </div>
            </nav>

            <main className="pricing-content">
                <div className="pricing-header">
                    <h1 className="pricing-title">Simple, transparent pricing</h1>
                    <p className="pricing-subtitle">Start collecting feedback today with our free plan. All the tools you need to build better products.</p>
                </div>

                <div className="pricing-cards">
                    <div className="pricing-card free-plan">
                        <div className="plan-header">
                            <h2 className="plan-name">Free</h2>
                            <div className="plan-price">£0<span>forever</span></div>
                        </div>
                        <ul className="plan-features">
                            <li><span className="check">✓</span> 1 feedback board per space</li>
                            <li><span className="check">✓</span> 10 ideas limit</li>
                            <li><span className="check">✓</span> Idea upvoting and commenting</li>
                            <li><span className="check">✓</span> Sprout branding</li>
                        </ul>
                        <Link to="/get-started" className="plan-btn">Get Started</Link>
                    </div>

                    <div className="pricing-card paid-plan">
                        <div className="plan-header">
                            <h2 className="plan-name">Paid</h2>
                            <div className="plan-price">£10<span>/year</span></div>
                        </div>
                        <ul className="plan-features">
                            <li><span className="check">✓</span> Unlimited feedback boards</li>
                            <li><span className="check">✓</span> Unlimited ideas</li>
                            <li><span className="check">✓</span> Idea upvoting and commenting</li>
                            <li><span className="check">✓</span> Custom space branding</li>
                            <li><span className="check">✓</span> Embedding options</li>
                            <li><span className="check">✓</span> Export ideas as CSV</li>
                            <li><span className="check">✓</span> Jira integration</li>
                        </ul>
                        {showWaitlist ? (
                            <form onSubmit={handleWaitlistSubmit} className="waitlist-form">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={waitlistEmail}
                                    onChange={(e) => setWaitlistEmail(e.target.value)}
                                    required
                                    className="waitlist-input"
                                />
                                <button type="submit" className="plan-btn waitlist-submit" disabled={isWaitlistSubmitting}>
                                    {isWaitlistSubmitting ? 'Joining...' : 'Submit'}
                                </button>
                                {waitlistMessage && <p className="waitlist-msg">{waitlistMessage}</p>}
                            </form>
                        ) : (
                            <button onClick={() => setShowWaitlist(true)} className="plan-btn">Join Waitlist</button>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
