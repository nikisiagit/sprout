
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, LayoutGrid, ChevronDown } from 'lucide-react';
import './ProfileDropdown.css';

interface ProfileDropdownProps {
    onLogout: () => void;
}

export function ProfileDropdown({ onLogout }: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => setIsOpen(!isOpen);

    return (
        <div className="profile-dropdown-container" ref={dropdownRef}>
            <button
                className={`profile-toggle-btn ${isOpen ? 'active' : ''}`}
                onClick={toggleDropdown}
                aria-label="Profile Menu"
                aria-expanded={isOpen}
            >
                <User size={18} />
                <span className="btn-label">Profile</span>
                <ChevronDown size={14} style={{ marginLeft: '4px' }} />
            </button>

            {isOpen && (
                <div className="profile-menu">
                    <Link to="/profile" className="profile-menu-item" onClick={() => setIsOpen(false)}>
                        <LayoutGrid size={16} />
                        My Spaces
                    </Link>
                    <button onClick={onLogout} className="profile-menu-item">
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}
