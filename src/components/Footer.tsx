import { Link } from 'react-router-dom';
import './Footer.css';

export function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-content">
                <div className="footer-links">
                    <Link to="/pricing" className="footer-link">Pricing</Link>
                    <Link to="/changelog" className="footer-link">Changelog</Link>
                    <a href="https://sprout-4sz.pages.dev/space/bhculturecalendar" target="_blank" rel="noopener noreferrer" className="footer-link">
                        Submit your idea
                    </a>
                </div>
                <div className="footer-copyright">
                    © {new Date().getFullYear()} Sprout. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
