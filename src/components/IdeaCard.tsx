import { ChevronUp, MessageSquare } from 'lucide-react';
import type { Idea } from '../types';
import './IdeaCard.css';

interface IdeaCardProps {
    idea: Idea;
    onVote: (id: string) => void;
}

export function IdeaCard({ idea, onVote }: IdeaCardProps) {
    // Mock author badge color based on name/role
    const getBadgeClass = (name: string) => {
        if (name.includes('admin')) return 'admin';
        if (name.includes('service')) return 'service';
        return 'user';
    };

    return (
        <div className="idea-card">
            <div className="vote-control">
                <button className="vote-btn" onClick={() => onVote(idea.id)}>
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
                        <span>{idea.commentCount}</span>
                    </div>

                    <div className="footer-item">
                        <div className={`author-badge ${getBadgeClass(idea.author.name)}`}>
                            {idea.author.name.substring(0, 2)}
                        </div>
                        <span>{idea.author.name}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
