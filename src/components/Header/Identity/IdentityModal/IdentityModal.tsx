import './IdentityModal.css'
import { useState } from 'react'

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

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(true)
    }

    const handleDragLeave = () => {
        setDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)

        const files = e.dataTransfer.files
        if (files.length > 0) {
            const file = files[0]
            const reader = new FileReader()
            reader.onload = (event) => {
                if (event.target?.result) {
                    setAvatarUrl(event.target.result as string)
                }
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSave = () => {
        onSave(name, avatarUrl)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Profile</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {/* Input Nom */}
                    <div className="form-group">
                        <label htmlFor="name">Name:</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="form-input"
                        />
                    </div>

                    {/* Avatar Preview */}
                    <div className="form-group">
                        <label>Avatar Preview:</label>
                        <div className="avatar-preview">
                            <img src={avatarUrl} alt="Avatar Preview" className="preview-image" />
                        </div>
                    </div>

                    {/* Drop Zone */}
                    <div className="form-group">
                        <label>Upload Avatar (Drag & Drop):</label>
                        <div
                            className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <p>Drag and drop an image here</p>
                            <p className="drop-hint">or click to select</p>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-save" onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    )
}

export default IdentityModal

