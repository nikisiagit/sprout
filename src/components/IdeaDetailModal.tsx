import { useState } from 'react';
import { Send } from 'lucide-react';
import { Modal } from './Modal';
import type { Idea, Status } from '../types';
import './IdeaDetailModal.css';

interface IdeaDetailModalProps {
    idea: Idea | null;
    isOpen: boolean;
    onClose: () => void;
    onAddComment: (ideaId: string, text: string) => void;
    onStatusChange: (ideaId: string, status: Status) => void;
    onSyncJira: (ideaId: string) => void;
}

export function IdeaDetailModal({ idea, isOpen, onClose, onAddComment, onStatusChange, onSyncJira }: IdeaDetailModalProps) {
    const [commentText, setCommentText] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);

    if (!idea) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        onAddComment(idea.id, commentText);
        setCommentText('');
    };

    const handleSyncClick = async () => {
        setIsSyncing(true);
        await onSyncJira(idea.id);
        setIsSyncing(false);
    }

    const statuses: Array<{ value: Status, label: string }> = [
        { value: 'new', label: 'New Idea' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'done', label: 'Done' }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Idea Details">
            <div className="idea-detail">
                <div className="detail-header">
                    <h3>{idea.title}</h3>

                    <div className="header-actions">
                        <div className="status-control">
                            <select
                                value={idea.status}
                                onChange={(e) => onStatusChange(idea.id, e.target.value as Status)}
                                className="status-select"
                            >
                                {statuses.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>

                        {idea.jiraIssueKey ? (
                            <div className="jira-badge">
                                <span>Jira: {idea.jiraIssueKey}</span>
                            </div>
                        ) : (
                            <button
                                onClick={handleSyncClick}
                                disabled={isSyncing}
                                className="jira-sync-btn"
                            >
                                {isSyncing ? 'Syncing...' : 'Sync to Jira'}
                            </button>
                        )}
                    </div>

                    <div className="vote-badge">
                        <span className="count">{idea.voteCount}</span> votes
                    </div>
                </div>

                <p className="detail-description">{idea.description}</p>

                <div className="detail-comments-section">
                    <h4>Comments ({idea.comments.length})</h4>

                    <div className="comments-list">
                        {idea.comments.length === 0 ? (
                            <p className="no-comments">No comments yet. Be the first!</p>
                        ) : (
                            idea.comments.map(comment => (
                                <div key={comment.id} className="comment-item">
                                    <div className="comment-bubble">
                                        <p>{comment.text}</p>
                                        <span className="time">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="comment-form">
                        <input
                            type="text"
                            className="comment-input"
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        <button type="submit" className="comment-submit-btn" disabled={!commentText.trim()}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </Modal>
    );
}
