import './Synopsis.css'
import { useState, useEffect } from 'react'

interface SynopsisProps {
    synopsisUrl?: string
    title?: string
}

function Synopsis({ synopsisUrl, title = "Synopsis" }: SynopsisProps) {
    const [synopsisText, setSynopsisText] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchSynopsis = async () => {
            if (!synopsisUrl) {
                setError('Aucune URL de synopsis')
                setLoading(false)
                return
            }

            try {
                // Extraire le titre de la page Wikipedia depuis l'URL
                const pageTitle = synopsisUrl.split('/wiki/')[1]

                if (!pageTitle) {
                    throw new Error('URL Wikipedia invalide')
                }

                // Utiliser l'API Wikipedia pour récupérer l'extrait
                const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${pageTitle}`
                const response = await fetch(apiUrl)

                if (!response.ok) {
                    throw new Error('Erreur lors du chargement du synopsis')
                }

                const data = await response.json()
                setSynopsisText(data.extract || 'Aucun synopsis disponible')
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erreur inconnue')
            } finally {
                setLoading(false)
            }
        }

        fetchSynopsis()
    }, [synopsisUrl])

    return (
        <div className="synopsis">
            <h3 className="synopsis-title">{title}</h3>
            <div className="synopsis-content">
                {loading && <p className="synopsis-loading">Chargement du synopsis...</p>}
                {error && <p className="synopsis-error">{error}</p>}
                {!loading && !error && (
                    <p className="synopsis-text">{synopsisText}</p>
                )}
            </div>
        </div>
    )
}

export default Synopsis

