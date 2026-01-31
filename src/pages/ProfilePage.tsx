import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';


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
        <div className="govuk-width-container">
            <header className="govuk-header" role="banner" data-module="govuk-header" style={{ marginBottom: '30px' }}>
                <div className="govuk-header__container govuk-width-container">
                    <div className="govuk-header__logo">
                        <span className="govuk-header__logotype">
                            <span className="govuk-header__logotype-text">
                                Sprout
                            </span>
                        </span>
                    </div>
                    <div className="govuk-header__content">
                        {user && <span className="govuk-body govuk-!-font-weight-bold" style={{ color: 'white', marginRight: '20px' }}>{user.email}</span>}
                        <button onClick={handleLogout} className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="govuk-main-wrapper" id="main-content" role="main">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        <div className="govuk-flex-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h1 className="govuk-heading-xl govuk-!-margin-bottom-0">Your Spaces</h1>
                            <Link to="/" className="govuk-button govuk-button--start govuk-!-margin-bottom-0">
                                New Space
                                <svg className="govuk-button__start-icon" xmlns="http://www.w3.org/2000/svg" width="17.5" height="19" viewBox="0 0 33 40" aria-hidden="true" focusable="false">
                                    <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z" />
                                </svg>
                            </Link>
                        </div>

                        {spaces.length === 0 ? (
                            <div className="govuk-inset-text">
                                <p className="govuk-body">You haven't created any spaces yet.</p>
                                <Link to="/" className="govuk-link">Create your first space</Link>
                            </div>
                        ) : (
                            <ul className="govuk-list">
                                {spaces.map(space => (
                                    <li key={space.id} style={{ marginBottom: '20px', border: '1px solid #b1b4b6', padding: '20px' }}>
                                        <h3 className="govuk-heading-m">
                                            <Link to={`/space/${space.slug}`} className="govuk-link govuk-link--no-visited-state">
                                                {space.name}
                                            </Link>
                                        </h3>
                                        <p className="govuk-body-s govuk-!-color-secondary">
                                            /{space.slug}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
