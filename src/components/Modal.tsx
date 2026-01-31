import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                backgroundColor: 'white',
                padding: '30px',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
                <div className="modal-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h2 className="govuk-heading-l govuk-!-margin-bottom-0">{title}</h2>
                    <button
                        className="govuk-link"
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0b0c0c', fontSize: '19px' }}
                    >
                        Close
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}
