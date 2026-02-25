import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { ChangelogItem } from '../types/extra';
import './ChangelogPage.css';

export function ChangelogPage() {
    const navigate = useNavigate();

    const changes: ChangelogItem[] = [
        {
            id: '6',
            date: '2026-02-25',
            title: 'Pricing & UI Updates',
            description: 'Added a hand-drawn animation to the landing page, moved the Pricing link to the main navigation, refined the Free tier to be completely free forever, outlined Paid tier features, and added a Waitlist for upcoming features.',
            tags: ['feature', 'ui']
        }
    ];

    return (
        <div className="changelog-container">
            <header className="changelog-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <ArrowLeft size={20} /> Back
                </button>
                <h1>Changelog</h1>
                <p>Latest updates and improvements to Sprout.</p>
            </header>

            <div className="changelog-list">
                {changes.map(item => (
                    <div key={item.id} className="changelog-item">
                        <div className="changelog-date">
                            {new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="changelog-content">
                            <div className="changelog-title-row">
                                <h2>{item.title}</h2>
                                <div className="tags">
                                    {item.tags.map(tag => (
                                        <span key={tag} className={`tag tag-${tag}`}>{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <p>{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
