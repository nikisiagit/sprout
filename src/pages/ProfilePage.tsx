import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Plus, ExternalLink, LogOut } from 'lucide-react';
import logo from '../assets/sprout-wordmark.png';
import './ProfilePage.css';

interface Space {
    id: string;
    slug: string;
    name: string;
    created_at: number;
}

interface User {
    id: string;
    email: string;
}

export function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/auth/profile');
            if (response.ok) {
                const data = await response.json() as any;
                setUser(data.user);
                setSpaces(data.spaces || []);
            } else {
                // Not authenticated
                navigate('/login');
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
            navigate('/login');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        navigate('/');
    };

    if (isLoading) {
        return (
            <div className="profile-container">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <header className="profile-header">
                <div className="profile-logo">
                    <img src={logo} alt="Sprout" style={{ width: '120px', height: 'auto' }} />
                </div>
                <div className="profile-actions">
                    <span className="user-email">{user?.email}</span>
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </header>

            <main className="profile-main">
                <div className="profile-section">
                    <div className="section-header">
                        <h2>Your Spaces</h2>
                        <Link to="/" className="new-space-btn">
                            <Plus size={16} /> New Space
                        </Link>
                    </div>

                    {spaces.length === 0 ? (
                        <div className="empty-spaces">
                            <p>You haven't created any spaces yet.</p>
                            <Link to="/" className="create-first-btn">Create your first space</Link>
                        </div>
                    ) : (
                        <div className="spaces-grid">
                            {spaces.map(space => (
                                <Link
                                    key={space.id}
                                    to={`/space/${space.slug}`}
                                    className="space-card"
                                >
                                    <div className="space-card-content">
                                        <h3>{space.name}</h3>
                                        <span className="space-slug">/{space.slug}</span>
                                    </div>
                                    <ExternalLink size={16} className="space-link-icon" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
