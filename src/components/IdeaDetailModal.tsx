import { useState } from 'react';
import { Send } from 'lucide-react';
import { Modal } from './Modal';
import type { Idea } from '../types';
import './IdeaDetailModal.css';

interface IdeaDetailModalProps {
    idea: Idea | null;
    isOpen: boolean;
    onClose: () => void;
    onAddComment: (ideaId: string, text: string) => void;
}

export function IdeaDetailModal({ idea, isOpen, onClose, onAddComment }: IdeaDetailModalProps) {
    const [commentText, setCommentText] = useState('');

    if (!idea) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        onAddComment(idea.id, commentText);
        setCommentText('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Idea Details">
            <div className="idea-detail">
                <div className="detail-header">
                    <h3>{idea.title}</h3>
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
