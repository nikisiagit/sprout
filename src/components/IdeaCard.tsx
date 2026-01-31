import { MessageSquare } from 'lucide-react';
import type { Idea } from '../types';

interface IdeaCardProps {
    idea: Idea;
    onVote: (id: string, e: React.MouseEvent) => void;
    onClick: (idea: Idea) => void;
}

export function IdeaCard({ idea, onVote, onClick }: IdeaCardProps) {
    return (
        <div
            className="govuk-summary-card"
            onClick={() => onClick(idea)}
            style={{
                marginBottom: '20px',
                border: '1px solid #b1b4b6',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f3f2f1')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
            <div className="govuk-summary-card__title-wrapper" style={{ padding: '15px', borderBottom: '1px solid #b1b4b6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="govuk-summary-card__title govuk-heading-s govuk-!-margin-bottom-0">
                    {idea.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`govuk-tag ${idea.status === 'new' ? 'govuk-tag--blue' : idea.status === 'done' ? 'govuk-tag--green' : 'govuk-tag--grey'}`}>
                        {idea.status.replace('-', ' ')}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span className="govuk-body-s govuk-!-margin-bottom-0" style={{ fontWeight: 'bold' }}>{idea.voteCount}</span>
                        <button
                            className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
                            onClick={(e) => onVote(idea.id, e)}
                            disabled={idea.status !== 'new'}
                            style={{ padding: '5px 10px', minWidth: 'auto', opacity: idea.status !== 'new' ? 0.5 : 1 }}
                        >
                            Change
                        </button>
                    </div>
                </div>
            </div>
            <div className="govuk-summary-card__content" style={{ padding: '15px' }}>
                <p className="govuk-body">{idea.description}</p>
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px', color: '#505a5f' }}>
                    <MessageSquare size={16} />
                    <span className="govuk-body-s govuk-!-margin-bottom-0">{idea.comments.length} comments</span>
                </div>
            </div>
        </div>
    );
}
