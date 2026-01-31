import { Lightbulb, Loader2, Ban, CheckCircle, List, ChevronDown } from 'lucide-react';
import type { Idea } from '../types';
import { format } from 'date-fns';
import './Sidebar.css';

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
                    {recentComments.length === 0 ? (
                        <p className="no-comments-sidebar">No comments yet</p>
                    ) : (
                        recentComments.map((comment) => (
                            <div key={comment.id} className="comment-preview">
                                <span className="comment-date">
                                    {format(new Date(comment.createdAt), 'd MMMM yyyy, HH:mm')}
                                </span>
                                <p className="comment-text">{comment.text}</p>
                                <span className="comment-meta">Idea: {comment.ideaTitle}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
