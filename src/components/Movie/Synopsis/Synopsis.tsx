import './Synopsis.css'
import { useState, useEffect } from 'react'

interface SynopsisProps {
    synopsisUrl?: string
    title?: string
}

type Lang = 'fr' | 'en' | 'es'

const LANG_FLAGS: Record<Lang, string> = { en: '🇬🇧', fr: '🇫🇷', es: '🇪🇸' }

function Synopsis({ synopsisUrl, title = "Synopsis" }: SynopsisProps) {
    const [synopsisText, setSynopsisText] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [lang, setLang] = useState<Lang>('en')

    useEffect(() => {
        const fetchSynopsis = async () => {
            if (!synopsisUrl) {
                setError('Aucune URL de synopsis')
                setLoading(false)
                return
            }

            try {
                const pageTitle = synopsisUrl.split('/wiki/')[1]
                if (!pageTitle) throw new Error('URL Wikipedia invalide')

                const apiUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${pageTitle}`
                const response = await fetch(apiUrl)
                if (!response.ok) throw new Error('Erreur lors du chargement du synopsis')

                const data = await response.json()
                setSynopsisText(data.extract || 'Aucun synopsis disponible')
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erreur inconnue')
            } finally {
                setLoading(false)
            }
        }

        setLoading(true)
        setError(null)
        fetchSynopsis()
    }, [synopsisUrl, lang])

    return (
        <div className="synopsis">
            <div className="synopsis-header">
                <h3 className="synopsis-title">{title}</h3>
                <div className="chapter-lang-selector">
                    <span className="chapter-lang-label">Langue :</span>
                    {(['fr', 'en', 'es'] as Lang[]).map(l => (
                        <button
                            key={l}
                            className={`chapter-lang-btn ${lang === l ? 'active' : ''}`}
                            onClick={() => setLang(l)}
                            title={l}
                        >
                            {LANG_FLAGS[l]}
                        </button>
                    ))}
                </div>
            </div>
            <div className="synopsis-content">
                {loading && <p className="synopsis-loading">Chargement du synopsis...</p>}
                {error && <p className="synopsis-error">{error}</p>}
                {!loading && !error && <p className="synopsis-text">{synopsisText}</p>}
            </div>
        </div>
    )
}

export default Synopsis