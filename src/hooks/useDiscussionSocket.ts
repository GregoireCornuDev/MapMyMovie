import { useState, useEffect, useRef, useCallback } from 'react'
import { DiscussionMessage } from '../types/Message'

const RECONNECT_DELAY = 3000 // Délai en ms entre chaque tentative de reconnexion

export function useDiscussionSocket(url: string) {
    const [messages, setMessages] = useState<DiscussionMessage[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const wsRef = useRef<WebSocket | null>(null)

    // Empêche la reconnexion si le composant est démonté
    const shouldReconnect = useRef(true)
    const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

    const connect = useCallback(() => {
        if (!shouldReconnect.current) return

        // Ferme l'ancienne connexion avant d'en ouvrir une nouvelle
        if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
            wsRef.current.onclose = null // Empêche la reconnexion déclenchée par cette fermeture
            wsRef.current.close()
        }

        // Stocke le socket dans une ref pour pouvoir y accéder dans les callbacks
        const ws = new WebSocket(url)
        wsRef.current = ws

        // Met à jour l'état de connexion à l'ouverture du socket
        ws.onopen = () => setIsConnected(true)

        // Se reconnecte automatiquement après RECONNECT_DELAY ms si le composant est toujours monté
        ws.onclose = () => {
            setIsConnected(false)
            if (shouldReconnect.current) {
                reconnectTimeout.current = setTimeout(() => connect(), RECONNECT_DELAY)
            }
        }

        // onclose est appelé juste après onerror — la reconnexion est gérée là
        ws.onerror = () => {}

        // Traite les messages entrants
        ws.onmessage = (evt) => {
            try {
                const data = JSON.parse(evt.data)
                if (Array.isArray(data) && data.length > 1) {
                    // Reçoit la liste complète à la connexion — remplace tout
                    setMessages(data)
                } else if (Array.isArray(data) && data.length === 1) {
                    // Reçoit le dernier message envoyé — l'ajoute à la liste
                    setMessages(prev => [...prev, data[0]])
                } else {
                    // Reçoit un objet unique — l'ajoute à la liste
                    setMessages(prev => [...prev, data])
                }
            } catch {
                console.error('Message invalide:', evt.data)
            }
        }
    }, [url])

    // Établit la connexion au montage et la nettoie au démontage
    useEffect(() => {
        shouldReconnect.current = true
        connect()

        // Annule la reconnexion en cours et ferme le socket au démontage
        return () => {
            shouldReconnect.current = false
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current)
            wsRef.current?.close()
        }
    }, [connect])

    const isSending = useRef(false)

    // Envoie un message sur le WebSocket si la connexion est ouverte
    const sendMessage = useCallback((name: string, message: string, moment?: number) => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) return
        if (isSending.current) return
        isSending.current = true
        wsRef.current.send(JSON.stringify({ name, message, ...(moment !== undefined && { moment }) }))
        setTimeout(() => { isSending.current = false }, 500)
    }, [])

    // Retourne les messages reçus, l'état de connexion et la fonction d'envoi de message
    return { messages, isConnected, sendMessage }
}