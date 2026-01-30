import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import logo from '../assets/sprout-branding.jpg';
import { Sidebar } from '../components/Sidebar';
import { IdeaCard } from '../components/IdeaCard';
import { Modal } from '../components/Modal';
import { IdeaDetailModal } from '../components/IdeaDetailModal';
import type { Idea, Comment } from '../types';

export function BoardPage() {
    const { slug } = useParams<{ slug: string }>();
    const productName = slug ? slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Product';

    const [activeFilter, setActiveFilter] = useState('new');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

    // New Idea Form
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            fetchIdeas();
        }
    }, [slug]);

    const fetchIdeas = async () => {
        try {
            const response = await fetch(`/api/ideas?space=${slug}`);
            if (response.ok) {
                const data = await response.json() as Idea[];
                setIdeas(data);
            }
        } catch (error) {
            console.error('Failed to fetch ideas', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVote = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();

        // Optimistic UI update
        const updatedIdeas = ideas.map(idea =>
            idea.id === id ? { ...idea, voteCount: idea.voteCount + 1 } : idea
        );
        setIdeas(updatedIdeas);

        if (selectedIdea && selectedIdea.id === id) {
            setSelectedIdea(prev => prev ? { ...prev, voteCount: prev.voteCount + 1 } : null);
        }

        try {
            await fetch(`/api/ideas/${id}/vote`, { method: 'POST' });
        } catch (error) {
            console.error('Failed to vote', error);
            // Revert on error (could be implemented)
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !slug) return;

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTitle,
                    description: newDesc,
                    space_slug: slug
                })
            });

            if (response.ok) {
                const newIdea = await response.json() as Idea;
                setIdeas([newIdea, ...ideas]);
                setNewTitle('');
                setNewDesc('');
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Failed to create idea', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddComment = async (ideaId: string, text: string) => {
        try {
            const response = await fetch(`/api/ideas/${ideaId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            if (response.ok) {
                const newComment = await response.json() as Comment;

                const updateIdea = (idea: Idea) => ({
                    ...idea,
                    comments: [newComment, ...idea.comments]
                });

                setIdeas(prev => prev.map(idea => idea.id === ideaId ? updateIdea(idea) : idea));

                if (selectedIdea && selectedIdea.id === ideaId) {
                    setSelectedIdea(prev => prev ? updateIdea(prev) : null);
                }
            }
        } catch (error) {
            console.error('Failed to add comment', error);
        }
    };

    const filteredIdeas = ideas.filter(idea => {
        if (activeFilter === 'all') return true;
        return idea.status === activeFilter;
    }).filter(idea =>
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-top">
                    <div className="header-title">
                        <h1>
                            <div className="header-icon" style={{ background: 'transparent' }}>
                                <img src={logo} alt="Sprout Logo" style={{ width: '40px', height: 'auto' }} />
                            </div>
                            {productName}
                        </h1>
                        <p className="header-subtitle">Community tool for product improvements</p>
                    </div>
                    <button className="btn-primary" onClick={() => setIsModalOpen(true)}>Suggest idea</button>
                </div>

                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search ideas"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="search-icon" size={20} />
                </div>
            </header>

            <main className="main-layout">
                <div className="ideas-list">
                    {isLoading ? (
                        <div className="loading-state">Loading ideas...</div>
                    ) : filteredIdeas.length === 0 ? (
                        <div className="empty-state">
                            <p>No ideas yet. Be the first to suggest one!</p>
                        </div>
                    ) : (
                        filteredIdeas.map(idea => (
                            <IdeaCard
                                key={idea.id}
                                idea={idea}
                                onVote={handleVote}
                                onClick={(idea) => setSelectedIdea(idea)}
                            />
                        ))
                    )}
                </div>

                <aside>
                    <Sidebar activeFilter={activeFilter} onFilterChange={setActiveFilter} ideas={ideas} />
                </aside>
            </main>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Suggest a new idea"
            >
                <form onSubmit={handleSubmit} className="idea-form">
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            id="title"
                            type="text"
                            className="form-input"
                            placeholder="What's your idea?"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            className="form-textarea"
                            placeholder="Describe your idea in detail..."
                            rows={4}
                            value={newDesc}
                            onChange={e => setNewDesc(e.target.value)}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Idea'}
                        </button>
                    </div>
                </form>
            </Modal>

            <IdeaDetailModal
                idea={selectedIdea}
                isOpen={!!selectedIdea}
                onClose={() => setSelectedIdea(null)}
                onAddComment={handleAddComment}
            />
        </div>
    );
}
