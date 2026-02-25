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

    // Charge le nom et l'avatar sauvegardés au montage
    useEffect(() => {
        const savedName = localStorage.getItem('identity_name')
        const savedAvatarUrl = localStorage.getItem('identity_avatar')
        if (savedName) setName(savedName)
        if (savedAvatarUrl) setAvatarUrl(savedAvatarUrl)
    }, [])

    // Sauvegarde les nouvelles valeurs et remonte les données au parent
    const handleSave = (newName: string, newAvatarUrl: string) => {
        setName(newName)
        setAvatarUrl(newAvatarUrl)
        localStorage.setItem('identity_name', newName)
        localStorage.setItem('identity_avatar', newAvatarUrl)
        onIdentityChange?.(newName, newAvatarUrl)
    }

    return (
        <>
            {/* Bouton d'identité — ouvre la modale de modification */}
            <button
                className="identity"
                onClick={() => setIsModalOpen(true)}
                aria-label={`Modifier votre identité — actuellement : ${name}`}
                aria-haspopup="dialog"
            >
                <span className="identity-name">{name}</span>
                {/* alt vide : l'image est décorative, le nom suffit */}
                <img src={avatarUrl} alt="" aria-hidden="true" className="identity-avatar" />
            </button>

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