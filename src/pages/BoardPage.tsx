import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, Share2, ClipboardCheck, LogIn, LogOut, Download } from 'lucide-react';
import logo from '../assets/sprout-wordmark.png';
import { Sidebar } from '../components/Sidebar';
import { IdeaCard } from '../components/IdeaCard';
import { Modal } from '../components/Modal';
import { IdeaDetailModal } from '../components/IdeaDetailModal';
import type { Idea, Comment, Status } from '../types';

export function BoardPage() {
    const { slug } = useParams<{ slug: string }>();
    const [spaceName, setSpaceName] = useState('');
    const productName = spaceName || (slug ? slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Product');

    const [activeFilter, setActiveFilter] = useState('new');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

    // New Idea Form
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Share button state
    const [isCopied, setIsCopied] = useState(false);

    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Owner state
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        if (slug) {
            fetchSpaceInfo();
            fetchIdeas();
        }
    }, [slug]);

    const fetchSpaceInfo = async () => {
        try {
            const response = await fetch(`/api/spaces/${slug}`);
            if (response.ok) {
                const data = await response.json() as any;
                setIsOwner(data.isOwner);
                if (data.space) {
                    setSpaceName(data.space.name);
                }
            }
        } catch (error) {
            console.error('Failed to fetch space info', error);
        }
    };

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

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setIsOwner(false);
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

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const handleStatusChange = async (ideaId: string, newStatus: Status) => {
        // Optimistic Update
        const updateIdea = (idea: Idea) => ({ ...idea, status: newStatus });
        setIdeas(prev => prev.map(idea => idea.id === ideaId ? updateIdea(idea) : idea));
        if (selectedIdea && selectedIdea.id === ideaId) {
            setSelectedIdea(prev => prev ? updateIdea(prev) : null);
        }

        try {
            const response = await fetch(`/api/ideas/${ideaId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }
        } catch (error) {
            console.error('Failed to update status', error);
            // Revert on error could be added here
        }
    };

    /*
    const handleSyncJira = async (ideaId: string) => {
        try {
            const response = await fetch(`/api/ideas/${ideaId}/jira`, { method: 'POST' });
            if (response.ok) {
                const data = await response.json() as any;
                // Update local state with issueKey
                const updateIdea = (idea: Idea) => ({ ...idea, jiraIssueKey: data.issueKey });
                setIdeas(prev => prev.map(i => i.id === ideaId ? updateIdea(i) : i));
                if (selectedIdea && selectedIdea.id === ideaId) {
                    setSelectedIdea(prev => prev ? updateIdea(prev) : null);
                }
                alert(`Successfully synced to Jira! Issue Key: ${data.issueKey}`);
            } else {
                alert('Failed to sync to Jira. Please check if your Jira credentials are set in Cloudflare dashboard.');
            }
        } catch (error) {
            console.error('Error syncing to Jira', error);
            alert('Error syncing to Jira');
        }
    };
    */

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
                            <img src={logo} alt="Sprout" style={{ width: '100px', height: 'auto' }} />
                            <span>{productName}</span>
                        </h1>
                        <p className="header-subtitle">Community tool for product improvements</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {isOwner ? (
                            <button
                                className="btn-secondary"
                                onClick={handleLogout}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        ) : (
                            <Link
                                to={`/login?redirect=/space/${slug}`}
                                className="btn-secondary"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                            >
                                <LogIn size={16} /> Owner Login
                            </Link>
                        )}
                        <button className="btn-secondary" onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isCopied ? <ClipboardCheck size={16} /> : <Share2 size={16} />}
                            {isCopied ? 'Copied Link' : 'Share'}
                        </button>
                        {isOwner && (
                            <a
                                href={`/api/spaces/${slug}/export`}
                                className="btn-secondary"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}
                                download
                            >
                                <Download size={16} /> Export CSV
                            </a>
                        )}
                        <button className="btn-primary btn-flash" onClick={() => setIsModalOpen(true)}>Suggest idea</button>
                    </div>
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
                onStatusChange={handleStatusChange}
                isOwner={isOwner}
            />
        </div>
    );
}
