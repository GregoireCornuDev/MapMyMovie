import { DiscussionMessage } from '../../../types/Message'
import './MessageList.css'
import { useEffect, useRef } from 'react'

// Convertit un nombre de secondes en hh:mm:ss
function secondsToHms(seconds: number): string {
    const s = Math.floor(Number(seconds)) // Au cas où le back renverrait une chaîne
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return [h, m, sec].map(v => String(v).padStart(2, '0')).join(':')
}

// Convertit un timestamp Unix en heure lisible
function formatWhen(when: string): string {
    const date = new Date(Number(when))
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

interface MessageListProps {
    messages: DiscussionMessage[]
}

function MessageList({ messages }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null)

    // Scroll automatique vers le bas à chaque nouveau message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    return (
        <ol
            className="message-list"
            aria-label="Messages de la discussion"
            aria-live="polite"
            aria-relevant="additions"
        >
            {messages.map((msg, index) => (
                <li key={index} className="message">
                    <div className="message-header">
                        <span className="name">{msg.name}</span>
                        {/* aria-label pour que le lecteur d'écran annonce l'heure correctement */}
                        <time
                            className="when"
                            dateTime={new Date(Number(msg.when) * 1000).toISOString()}
                            aria-label={`Envoyé à ${formatWhen(msg.when)}`}
                        >
                            {formatWhen(msg.when)}
                        </time>
                    </div>
                    <p className="message-content">
                        {msg.message}
                        {msg.moment && (
                            // aria-label pour annoncer le timecode du moment partagé
                            <span
                                className="moment"
                                aria-label={`Moment partagé à ${secondsToHms(msg.moment)}`}
                            >
                                {secondsToHms(msg.moment)}
                            </span>
                        )}
                    </p>
                </li>
            ))}
            {/* Ancre invisible pour le scroll automatique */}
            <div ref={bottomRef} aria-hidden="true" />
        </ol>
    )
}

export default MessageList