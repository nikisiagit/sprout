import { useState } from 'react';
import { Search, Lightbulb } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { IdeaCard } from './components/IdeaCard';
import { Modal } from './components/Modal';
import type { Idea } from './types';
import './App.css';

function App() {
  const [activeFilter, setActiveFilter] = useState('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const [ideas, setIdeas] = useState<Idea[]>([
    {
      id: '1',
      title: 'Searching for contacts when composing a new email',
      description: "When composing an email, selecting the 'To' field does not search the database of created users for your domain. The user has both first and last name filled in 'Personal Data'. Additionally, the list of names in t...",
      status: 'new',
      voteCount: 587,
      commentCount: 0,
      createdAt: '2026-01-29T10:00:00Z',
      author: { id: 'a1', name: 'admin', avatar: 'AD' }
    },
    {
      id: '2',
      title: 'Formatting in EDGE',
      description: "In the dark theme of the EDGE browser, the 'forward message' mode does not work correctly: part of the correspondence appears in white text on a white background.",
      status: 'new',
      voteCount: 20,
      commentCount: 0,
      createdAt: '2026-01-29T09:00:00Z',
      author: { id: 'a2', name: 'service', avatar: 'SE' }
    },
    {
      id: '3',
      title: 'Calendar',
      description: 'Add calendar',
      status: 'new',
      voteCount: 11,
      commentCount: 3,
      createdAt: '2026-01-28T15:00:00Z',
      author: { id: 'u1', name: 'h4vm2', avatar: 'H4' }
    },
    {
      id: '4',
      title: 'Design',
      description: 'Please add design options for the main window; I would like a brighter or more pronounced interface, maybe create a theme inspired by Mail.ru.',
      status: 'new',
      voteCount: 5,
      commentCount: 0,
      createdAt: '2026-01-28T14:00:00Z',
      author: { id: 'u2', name: 'inbox', avatar: 'IN' }
    },
    {
      id: '5',
      title: 'File Download',
      description: "There needs to be a way to download files that were sent in the middle of a thread. Because currently, in a thread of 20 emails, it's impossible to download what was sent in the 10th email (hypothetically).",
      status: 'new',
      voteCount: 7,
      commentCount: 0,
      createdAt: '2026-01-28T12:00:00Z',
      author: { id: 'u3', name: 'tatyana.subbotina', avatar: 'TS' }
    }
  ]);

  const handleVote = (id: string) => {
    setIdeas(ideas.map(idea =>
      idea.id === id ? { ...idea, voteCount: idea.voteCount + 1 } : idea
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newIdea: Idea = {
      id: Date.now().toString(),
      title: newTitle,
      description: newDesc,
      status: 'new',
      voteCount: 1, // Self vote
      commentCount: 0,
      createdAt: new Date().toISOString(),
      author: { id: 'me', name: 'me', avatar: 'ME' }
    };

    setIdeas([newIdea, ...ideas]);
    setNewTitle('');
    setNewDesc('');
    setIsModalOpen(false);
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
              <div className="header-icon">
                <Lightbulb size={24} />
              </div>
              Do you have an idea?
            </h1>
            <p className="header-subtitle">Suggest your ideas for improving our email service</p>
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
          {filteredIdeas.map(idea => (
            <IdeaCard key={idea.id} idea={idea} onVote={handleVote} />
          ))}
        </div>

        <aside>
          <Sidebar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
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
            <button type="submit" className="btn-primary">Submit Idea</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default App;
