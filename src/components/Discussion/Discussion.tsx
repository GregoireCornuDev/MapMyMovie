import './Discussion.css'
import { useDiscussionSocket } from '../../hooks/useDiscussionSocket'
import MessageList from './MessageList/MessageList'
import MessageInput from './MessageInput/MessageInput'
import Identity from './Identity/Identity'

interface DiscussionProps {
    wsUrl: string
    userName: string
    currentTime?: number
    onIdentityChange?: (name: string, avatarUrl: string) => void
}

function Discussion({ wsUrl, userName, currentTime = 0, onIdentityChange }: DiscussionProps) {
    const { messages, isConnected, sendMessage } = useDiscussionSocket(wsUrl)

    return (
        <section className="discussion" aria-label="Discussion en direct">

            {/* Identité de l'utilisateur — cliquable pour modifier nom et avatar */}
            <Identity onIdentityChange={onIdentityChange} />

            <div className="discussion-header">
                <h2>Discussion</h2>
                {/* Indicateur de connexion au WebSocket */}
                <span
                    className={`status ${isConnected ? 'connected' : ''}`}
                    role="status"
                    aria-live="polite"
                    aria-label={isConnected ? 'Connecté au chat' : 'Déconnecté du chat'}
                >
                    {isConnected ? 'En ligne' : 'Hors ligne'}
                </span>
            </div>

            {/* Liste des messages reçus via WebSocket */}
            <MessageList messages={messages} />

            {/* Champ de saisie — le bouton Moment est désactivé si le film n'est pas lancé */}
            <MessageInput
                onSend={(message) => sendMessage(userName, message)}
                onMoment={() => sendMessage(userName, '🎬 Moment partagé', currentTime)}
                momentDisabled={currentTime === 0}
            />

        </section>
    )
}

export default Discussion