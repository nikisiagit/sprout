import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { ChangelogItem } from '../types/extra';
import './ChangelogPage.css';

export function ChangelogPage() {
    const navigate = useNavigate();

    const changes: ChangelogItem[] = [
        {
            id: '5',
            date: '2026-01-30',
            title: 'Jira Integration',
            description: 'You can now sync ideas directly to your Jira projects. Supports basic Jira Software and Jira Product Discovery.',
            tags: ['feature', 'integration']
        },
        {
            id: '4',
            date: '2026-01-30',
            title: 'Logo Fixes',
            description: 'Fixed an issue where the logo would overlap with the product name on smaller screens.',
            tags: ['fix', 'ui']
        },
        {
            id: '3',
            date: '2026-01-30',
            title: 'Status Management',
            description: 'Added the ability to change idea status (New, In Progress, Rejected, Done) directly from the details view.',
            tags: ['feature']
        },
        {
            id: '2',
            date: '2026-01-29',
            title: 'Cloudflare D1 Migration',
            description: 'Migrated the database layer from Supabase to Cloudflare D1 for better performance and edge compatibility.',
            tags: ['infrastructure']
        },
        {
            id: '1',
            date: '2026-01-28',
            title: 'Initial Launch',
            description: 'Sprout is live! Create spaces, submit ideas, vote, and comment.',
            tags: ['release']
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
