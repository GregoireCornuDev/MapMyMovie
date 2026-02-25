import './IdentityModal.css'
import { useState, useEffect, useRef } from 'react'

interface IdentityModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (name: string, avatarUrl: string) => void
    currentName?: string
    currentAvatarUrl?: string
}

function IdentityModal({ isOpen, onClose, onSave, currentName = "Who are you ?", currentAvatarUrl = "/miniature/zombi.png" }: IdentityModalProps) {
    const [name, setName] = useState(currentName)
    const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl)
    const [dragOver, setDragOver] = useState(false)
    const closeButtonRef = useRef<HTMLButtonElement>(null)

    // Remet le focus sur le bouton fermer à l'ouverture de la modale
    useEffect(() => {
        if (isOpen) closeButtonRef.current?.focus()
    }, [isOpen])

    // Ferme la modale avec Échap
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(true)
    }

    const handleDragLeave = () => setDragOver(false)

    // Charge l'image déposée en base64 pour la prévisualisation
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (event) => {
            if (event.target?.result) setAvatarUrl(event.target.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleSave = () => {
        onSave(name, avatarUrl)
        onClose()
    }

    if (!isOpen) return null

    return (
        // Overlay — clic en dehors ferme la modale
        <div
            className="modal-overlay"
            onClick={onClose}
            role="presentation"
            aria-hidden="true"
        >
            <div
                className="modal-content"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2 id="modal-title">Edit Profile</h2>
                    <button
                        ref={closeButtonRef}
                        className="modal-close"
                        onClick={onClose}
                        aria-label="Fermer la modale"
                    >
                        {/* aria-hidden : le label du bouton suffit */}
                        <span aria-hidden="true">×</span>
                    </button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label htmlFor="identity-name">Name:</label>
                        <input
                            id="identity-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="form-input"
                            autoComplete="nickname"
                        />
                    </div>

                    <div className="form-group">
                        <label>Avatar Preview:</label>
                        <div className="avatar-preview">
                            <img src={avatarUrl} alt="Prévisualisation de votre avatar" className="preview-image" />
                        </div>
                    </div>

                    {/* Zone de dépôt d'image — accessible au clavier via tabIndex */}
                    <div className="form-group">
                        <label id="drop-label">Upload Avatar (Drag & Drop):</label>
                        <div
                            className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            role="region"
                            aria-labelledby="drop-label"
                            aria-dropeffect="copy"
                        >
                            <p>Drag and drop an image here</p>
                            <p className="drop-hint">or click to select</p>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button
                        className="btn-save"
                        onClick={handleSave}
                        disabled={!name.trim()}
                        aria-disabled={!name.trim()}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}

export default IdentityModal