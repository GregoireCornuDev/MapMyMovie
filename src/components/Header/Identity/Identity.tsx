import './Identity.css'
import { useState, useEffect } from 'react'
import IdentityModal from './IdentityModal/IdentityModal'

interface IdentityProps {
    name?: string
    avatarUrl?: string
    onIdentityChange?: (name: string, avatarUrl: string) => void
}

function Identity({ name: defaultName = "Who are you ?", avatarUrl: defaultAvatarUrl = "/avatar/zombi.png", onIdentityChange }: IdentityProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [name, setName] = useState(defaultName)
    const [avatarUrl, setAvatarUrl] = useState(defaultAvatarUrl)

    // Charger depuis LocalStorage au montage
    useEffect(() => {
        const savedName = localStorage.getItem('identity_name')
        const savedAvatarUrl = localStorage.getItem('identity_avatar')

        if (savedName) setName(savedName)
        if (savedAvatarUrl) setAvatarUrl(savedAvatarUrl)
    }, [])

    const handleSave = (newName: string, newAvatarUrl: string) => {
        setName(newName)
        setAvatarUrl(newAvatarUrl)

        // Sauvegarder en LocalStorage
        localStorage.setItem('identity_name', newName)
        localStorage.setItem('identity_avatar', newAvatarUrl)

        // Appeler le callback pour remonter les données
        if (onIdentityChange) {
            onIdentityChange(newName, newAvatarUrl)
        }
    }

    return (
        <>
            <div className="identity" onClick={() => setIsModalOpen(true)}>
                <span className="identity-name">{name}</span>
                <img src={avatarUrl} alt={name} className="identity-avatar"/>

            </div>

            <IdentityModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                currentName={name}
                currentAvatarUrl={avatarUrl}
            />
        </>
    )
}

export default Identity




