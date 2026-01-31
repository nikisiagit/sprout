import { useNavigate } from 'react-router-dom';
import type { ChangelogItem } from '../types/extra';

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
        <div className="govuk-width-container">
            <button onClick={() => navigate(-1)} className="govuk-back-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                Back
            </button>
            <main className="govuk-main-wrapper">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        <h1 className="govuk-heading-xl">Changelog</h1>
                        <p className="govuk-body-l">Latest updates and improvements to Sprout.</p>

                        <div className="changelog-list">
                            {changes.map(item => (
                                <div key={item.id} style={{ borderLeft: '5px solid #1d70b8', paddingLeft: '20px', marginBottom: '30px' }}>
                                    <span className="govuk-caption-m">
                                        {new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </span>
                                    <h2 className="govuk-heading-m govuk-!-margin-bottom-1">
                                        {item.title}
                                        {item.tags.map(tag => (
                                            <strong key={tag} className="govuk-tag govuk-tag--grey" style={{ marginLeft: '10px', verticalAlign: 'middle' }}>
                                                {tag}
                                            </strong>
                                        ))}
                                    </h2>
                                    <p className="govuk-body">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
