import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logo from '../assets/sprout-wordmark.png';
import { fireConfetti } from '../lib/confetti';

export function SignUpPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, we would register the user via API
        // For now, we simulate success

        // Retrieve pending space creation from local storage or state if we had it
        const pendingSpace = localStorage.getItem('pendingSpace');

        if (pendingSpace) {
            const { slug } = JSON.parse(pendingSpace);
            fireConfetti();
            localStorage.removeItem('pendingSpace');
            navigate(`/space/${slug}`);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="landing-container">
            <div className="landing-content">
                <div className="logo-section">
                    <div className="logo-icon">
                        <img src={logo} alt="Sprout" style={{ width: '150px', height: 'auto' }} />
                    </div>
                </div>

                <form onSubmit={handleSignUp} className="create-space-form">
                    <h2>Almost there!</h2>
                    <p className="form-helper">Create an account to manage your space.</p>

                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="space-input"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="space-input"
                            required
                        />
                        <button type="submit" className="create-btn">
                            Sign Up & Launch
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
