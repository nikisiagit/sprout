import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Plus, ExternalLink, LogOut, Trash2 } from 'lucide-react';
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


    const handleDeleteSpace = async (slug: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (window.confirm('Are you sure you want to delete this space? This action cannot be undone and will delete all ideas and comments.')) {
            try {
                const response = await fetch(`/api/spaces/${slug}`, { method: 'DELETE' });
                if (response.ok) {
                    setSpaces(spaces.filter(s => s.slug !== slug));
                } else {
                    alert('Failed to delete space');
                }
            } catch (error) {
                console.error('Failed to delete space', error);
                alert('Failed to delete space');
            }
        }
    };

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
                                    style={{ position: 'relative' }}
                                >
                                    <div className="space-card-content">
                                        <h3>{space.name}</h3>
                                        <span className="space-slug">/{space.slug}</span>
                                    </div>
                                    <div className="space-card-actions" style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            className="delete-btn"
                                            onClick={(e) => handleDeleteSpace(space.slug, e)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#d64d4d',
                                                padding: '5px'
                                            }}
                                            title="Delete Space"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <ExternalLink size={16} className="space-link-icon" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
