import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import logo from '../assets/sprout-wordmark.png';
import './PricingPage.css';

export function PricingPage() {
    return (
        <div className="pricing-page">
            <nav className="landing-nav">
                <Link to="/">
                    <img src={logo} alt="Sprout" className="logo-img" />
                </Link>
                <div className="nav-actions">
                    <Link to="/login" className="nav-link">Sign in</Link>
                    <Link to="/get-started" className="nav-btn">Get Started</Link>
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
                            <div className="plan-price">$0<span>/month</span></div>
                        </div>
                        <ul className="plan-features">
                            <li><span className="check">✓</span> Create unlimited feedback boards</li>
                            <li><span className="check">✓</span> Feature upvoting & prioritization</li>
                            <li><span className="check">✓</span> Custom space branding</li>
                            <li><span className="check">✓</span> Community support & regular updates</li>
                        </ul>
                        <Link to="/get-started" className="plan-btn">Get Started</Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
