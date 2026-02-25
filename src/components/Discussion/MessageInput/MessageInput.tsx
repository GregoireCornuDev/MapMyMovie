import { useState } from 'react'
import './MessageInput.css'

interface MessageInputProps {
    onSend: (message: string) => void
    onMoment: () => void
    momentDisabled?: boolean
}

function MessageInput({ onSend, onMoment, momentDisabled }: MessageInputProps) {
    const [text, setText] = useState('')

    const handleSend = () => {
        if (text.trim()) {
            onSend(text.trim())
            setText('')
        }
    }

    // Envoie le message avec Entrée (sans Shift)
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="message-input" role="form" aria-label="Envoyer un message">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Votre message..."
                className="discussion-input"
                aria-label="Votre message"
                // Entrée pour envoyer, indiqué aux lecteurs d'écran
                aria-describedby="input-hint"
            />
            {/* Indication cachée visuellement pour les lecteurs d'écran */}
            <span id="input-hint" className="sr-only">
                Appuyez sur Entrée pour envoyer
            </span>

            {/* Partage le timecode actuel du film — désactivé si le film n'est pas lancé */}
            <button
                onClick={onMoment}
                disabled={momentDisabled}
                aria-label="Partager le moment actuel du film"
                aria-disabled={momentDisabled}
                title="Partager le moment"
            >
                {/* alt vide : le label du bouton suffit */}
                <img src="/icon/chrono.png" alt="" aria-hidden="true" className="icon-chrono" />
            </button>

            {/* Désactivé si le champ est vide */}
            <button
                onClick={handleSend}
                disabled={!text.trim()}
                aria-label="Envoyer le message"
                aria-disabled={!text.trim()}
                title="Envoyer"
            >
                <img src="/icon/send.png" alt="" aria-hidden="true" className="icon-send" />
            </button>
        </div>
    )
}

export default MessageInput