import { Lightbulb, Loader2, Ban, CheckCircle, List, ChevronDown } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
}

export function Sidebar({ activeFilter, onFilterChange }: SidebarProps) {
    const filters = [
        { id: 'new', label: 'New idea', icon: Lightbulb, count: 587 },
        { id: 'in-progress', label: 'In progress', icon: Loader2, count: 20 },
        { id: 'rejected', label: 'Rejected', icon: Ban, count: 68 },
        { id: 'done', label: 'Done', icon: CheckCircle, count: 466 },
        { id: 'all', label: 'All', icon: List, count: 1141 },
    ];

    const recentComments = [
        {
            id: 1,
            date: '29 January 2026, 23:24',
            text: 'Is it possible to move messages when creating a folder...',
            idea: 'Sorting'
        },
        {
            id: 2,
            date: '29 January 2026, 17:23',
            text: 'message',
            idea: 'Calendar'
        },
        {
            id: 3,
            date: '29 January 2026, 17:21',
            text: 'Idea: Calendar',
            idea: 'Calendar'
        }
    ];

    return (
        <div className="sidebar-container">
            <div className="sort-dropdown">
                <span>New first</span>
                <ChevronDown size={16} />
            </div>

            <div className="sidebar">
                <div className="filters-section">
                    <div className="filter-list">
                        {filters.map((filter) => (
                            <div
                                key={filter.id}
                                className={`filter-item ${activeFilter === filter.id ? 'active' : ''}`}
                                onClick={() => onFilterChange(filter.id)}
                            >
                                <div className="filter-icon-wrapper">
                                    <filter.icon size={18} />
                                    <span>{filter.label}</span>
                                </div>
                                <span className="filter-count">{filter.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="comments-section">
                    <h3>New comments</h3>
                    {recentComments.map((comment) => (
                        <div key={comment.id} className="comment-preview">
                            <span className="comment-date">{comment.date}</span>
                            <p className="comment-text">{comment.text}</p>
                            <span className="comment-meta">Idea: {comment.idea}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
