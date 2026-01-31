import { Lightbulb, Loader2, Ban, CheckCircle, List } from 'lucide-react';
import type { Idea } from '../types';
import { format } from 'date-fns';

interface SidebarProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    ideas: Idea[];
}

export function Sidebar({ activeFilter, onFilterChange, ideas }: SidebarProps) {
    const counts = {
        new: ideas.filter(i => i.status === 'new').length,
        'in-progress': ideas.filter(i => i.status === 'in-progress').length,
        rejected: ideas.filter(i => i.status === 'rejected').length,
        done: ideas.filter(i => i.status === 'done').length,
        all: ideas.length
    };

    const filters = [
        { id: 'new', label: 'New idea', icon: Lightbulb, count: counts.new },
        { id: 'in-progress', label: 'In progress', icon: Loader2, count: counts['in-progress'] },
        { id: 'rejected', label: 'Rejected', icon: Ban, count: counts.rejected },
        { id: 'done', label: 'Done', icon: CheckCircle, count: counts.done },
        { id: 'all', label: 'All', icon: List, count: counts.all },
    ];

    // Get all comments with idea details, flattened
    const allComments = ideas.flatMap(idea =>
        idea.comments.map(comment => ({
            ...comment,
            ideaTitle: idea.title
        }))
    );

    // Sort by date desc and take top 5
    const recentComments = allComments
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    return (
        <div className="sidebar-container" style={{ paddingTop: '20px' }}>
            <div className="sidebar">
                <div className="filters-section" style={{ marginBottom: '30px' }}>
                    <h2 className="govuk-heading-s">Filters</h2>
                    <ul className="govuk-list govuk-list--spaced">
                        {filters.map((filter) => (
                            <li key={filter.id}>
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); onFilterChange(filter.id); }}
                                    className={`govuk-link ${activeFilter === filter.id ? 'govuk-!-font-weight-bold' : 'govuk-link--no-visited-state'}`}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        color: activeFilter === filter.id ? '#1d70b8' : undefined,
                                        textDecoration: 'none'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <filter.icon size={16} />
                                        <span>{filter.label}</span>
                                    </div>
                                    <span className="govuk-tag govuk-tag--grey" style={{ marginLeft: '10px' }}>{filter.count}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="comments-section" style={{ borderTop: '2px solid #1d70b8', paddingTop: '20px' }}>
                    <h3 className="govuk-heading-s">Activity</h3>
                    {recentComments.length === 0 ? (
                        <p className="govuk-body-s">No comments yet</p>
                    ) : (
                        recentComments.map((comment) => (
                            <div key={comment.id} className="govuk-body-s" style={{ marginBottom: '15px', borderBottom: '1px solid #b1b4b6', paddingBottom: '10px' }}>
                                <p className="govuk-!-margin-bottom-1" style={{ color: '#505a5f' }}>
                                    {format(new Date(comment.createdAt), 'd MMM, HH:mm')}
                                </p>
                                <p className="govuk-!-margin-bottom-1">"{comment.text}"</p>
                                <span style={{ fontSize: '12px', color: '#505a5f' }}>On: {comment.ideaTitle}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
