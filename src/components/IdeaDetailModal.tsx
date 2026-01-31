import { useState } from 'react';
import { Modal } from './Modal';
import type { Idea, Status } from '../types';

interface IdeaDetailModalProps {
    idea: Idea | null;
    isOpen: boolean;
    onClose: () => void;
    onAddComment: (ideaId: string, text: string) => void;
    onStatusChange: (ideaId: string, status: Status) => void;
    isOwner?: boolean;
}

export function IdeaDetailModal({ idea, isOpen, onClose, onAddComment, onStatusChange, isOwner = false }: IdeaDetailModalProps) {
    const [commentText, setCommentText] = useState('');
    // const [isSyncing, setIsSyncing] = useState(false);

    if (!idea) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        onAddComment(idea.id, commentText);
        setCommentText('');
    };

    /*
    const handleSyncClick = async () => {
        setIsSyncing(true);
        await onSyncJira(idea.id);
        setIsSyncing(false);
    }
    */

    const statuses: Array<{ value: Status, label: string }> = [
        { value: 'new', label: 'New Idea' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'done', label: 'Done' }
    ];

    const currentStatusLabel = statuses.find(s => s.value === idea.status)?.label || idea.status;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Idea Details">
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <h3 className="govuk-heading-l">{idea.title}</h3>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #b1b4b6', paddingBottom: '15px' }}>
                        <div className="status-control">
                            {isOwner ? (
                                <div className="govuk-form-group" style={{ marginBottom: 0 }}>
                                    <label className="govuk-label" htmlFor="status-select">Status</label>
                                    <select
                                        id="status-select"
                                        value={idea.status}
                                        onChange={(e) => onStatusChange(idea.id, e.target.value as Status)}
                                        className="govuk-select"
                                    >
                                        {statuses.map(s => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <strong className={`govuk-tag ${idea.status === 'new' ? 'govuk-tag--blue' : idea.status === 'done' ? 'govuk-tag--green' : 'govuk-tag--grey'}`}>
                                    {currentStatusLabel}
                                </strong>
                            )}
                        </div>

                        <div className="govuk-body" style={{ marginBottom: 0 }}>
                            <strong>{idea.voteCount}</strong> votes
                        </div>
                    </div>

                    <p className="govuk-body-l">{idea.description}</p>

                    <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

                    <h4 className="govuk-heading-m">Comments ({idea.comments.length})</h4>

                    <div className="comments-list" style={{ marginBottom: '30px' }}>
                        {idea.comments.length === 0 ? (
                            <p className="govuk-body">No comments yet. Be the first!</p>
                        ) : (
                            idea.comments.map(comment => (
                                <div key={comment.id} style={{ marginBottom: '15px', padding: '15px', background: '#f3f2f1', borderLeft: '5px solid #1d70b8' }}>
                                    <p className="govuk-body" style={{ marginBottom: '5px' }}>{comment.text}</p>
                                    <span className="govuk-body-s" style={{ color: '#505a5f' }}>
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    {idea.status === 'new' ? (
                        <form onSubmit={handleSubmit}>
                            <div className="govuk-form-group">
                                <label className="govuk-label" htmlFor="comment">Add a comment</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        id="comment"
                                        className="govuk-input"
                                        placeholder="Add a comment..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        style={{ flexGrow: 1 }}
                                    />
                                    <button type="submit" className="govuk-button" disabled={!commentText.trim()}>
                                        Send
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="govuk-inset-text">
                            Voting and commenting are closed for this idea.
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
