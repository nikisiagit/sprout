import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logo from '../assets/sprout-branding.jpg';

export function LandingPage() {
    const [productName, setProductName] = useState('');
    const navigate = useNavigate();

    const handleCreateSpace = (e: React.FormEvent) => {
        e.preventDefault();
        if (!productName.trim()) return;

        // Create a URL-friendly slug
        const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        navigate(`/space/${slug}`);
    };

    return (
        <div className="landing-container">
            <div className="landing-content">
                <div className="logo-section">
                    <div className="logo-icon">
                        <img src={logo} alt="Sprout Logo" style={{ width: '120px', height: 'auto' }} />
                    </div>
                    <h1>Sprout</h1>
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
                        <button type="submit" className="create-btn">
                            Create Space
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
