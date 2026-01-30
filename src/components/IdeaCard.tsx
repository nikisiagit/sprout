import { ChevronUp, MessageSquare } from 'lucide-react';
import type { Idea } from '../types';
import './IdeaCard.css';

interface IdeaCardProps {
    idea: Idea;
    onVote: (id: string, e: React.MouseEvent) => void;
    onClick: (idea: Idea) => void;
}

export function IdeaCard({ idea, onVote, onClick }: IdeaCardProps) {
    return (
        <div className="idea-card" onClick={() => onClick(idea)} style={{ cursor: 'pointer' }}>
            <div className="vote-control">
                <button
                    className="vote-btn"
                    onClick={(e) => onVote(idea.id, e)}
                >
                    <ChevronUp size={20} />
                </button>
                <span className="vote-count">{idea.voteCount}</span>
            </div>

            <div className="card-content">
                <h3 className="card-title">{idea.title}</h3>
                <p className="card-description">{idea.description}</p>

                <div className="card-footer">
                    <div className="footer-item">
                        <MessageSquare size={16} />
                        <span>{idea.comments.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
