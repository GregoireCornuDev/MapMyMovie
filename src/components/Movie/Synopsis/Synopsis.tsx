import './Synopsis.css'
import { useState, useEffect } from 'react'

interface SynopsisProps {
    synopsisUrl?: string
    title?: string
}

type Lang = 'fr' | 'en' | 'es'

const LANG_FLAGS: Record<Lang, string> = { en: '🇬🇧', fr: '🇫🇷', es: '🇪🇸' }
const LANG_LABELS: Record<Lang, string> = { en: 'English', fr: 'Français', es: 'Español' }

function Synopsis({ synopsisUrl, title = "Synopsis" }: SynopsisProps) {
    const [synopsisText, setSynopsisText] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [lang, setLang] = useState<Lang>('en')

    // Recharge le synopsis depuis l'API Wikipedia à chaque changement de langue
    useEffect(() => {
        const fetchSynopsis = async () => {
            if (!synopsisUrl) {
                setError('Aucune URL de synopsis')
                setLoading(false)
                return
            }

            try {
                // Extrait le titre de la page depuis l'URL Wikipedia
                const pageTitle = synopsisUrl.split('/wiki/')[1]
                if (!pageTitle) throw new Error('URL Wikipedia invalide')

                // L'API Wikipedia supporte le multilingue via le sous-domaine
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
        <section className="synopsis" aria-labelledby="synopsis-title">
            <div className="synopsis-header">
                <h3 id="synopsis-title" className="synopsis-title">{title}</h3>

                {/* Sélecteur de langue — recharge le synopsis via l'API Wikipedia */}
                <div
                    className="chapter-lang-selector"
                    role="group"
                    aria-label="Langue du synopsis"
                >
                    <span className="chapter-lang-label" aria-hidden="true">Langue :</span>
                    {(['fr', 'en', 'es'] as Lang[]).map(l => (
                        <button
                            key={l}
                            className={`chapter-lang-btn ${lang === l ? 'active' : ''}`}
                            onClick={() => setLang(l)}
                            aria-label={LANG_LABELS[l]}
                            aria-pressed={lang === l}
                        >
                            <span aria-hidden="true">{LANG_FLAGS[l]}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="synopsis-content" aria-live="polite" aria-busy={loading}>
                {loading && (
                    <p role="status" className="synopsis-loading">
                        Chargement du synopsis...
                    </p>
                )}
                {error && (
                    <p role="alert" className="synopsis-error">{error}</p>
                )}
                {!loading && !error && (
                    <p className="synopsis-text">{synopsisText}</p>
                )}
            </div>
        </section>
    )
}

export default Synopsis