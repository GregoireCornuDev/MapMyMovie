import './ChapterList.css'
import { useState, useEffect } from 'react'
import { Chapter, timestampToSeconds } from '../../../../types/Chapter'
import { useMovieContext } from '../../../../context/MovieContext'
import { FALLBACK_CHAPTERS } from '../../../../mocks/chaptersFallback.ts'

interface ChapterListProps {
    chaptersUrl: string
}

type ChapterLang = 'en' | 'fr' | 'es'

function ChapterList({ chaptersUrl }: ChapterListProps) {
    const { currentTime, seek, setIsPlaying } = useMovieContext()

    const [chapters, setChapters] = useState<Chapter[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [lang, setLang] = useState<ChapterLang>('fr')

    // Ferme le menu si on clique en dehors
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (isOpen && !target.closest('.chapter-list-container')) {
                setIsOpen(false)
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [isOpen])

    // Charge les chapitres depuis le backend, avec fallback si indisponible
    useEffect(() => {
        const fetchChapters = async () => {
            try {
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 3000)

                const response = await fetch(chaptersUrl, { signal: controller.signal })
                clearTimeout(timeoutId)

                if (!response.ok) throw new Error('Erreur lors du chargement des chapitres')
                setChapters(await response.json())
            } catch {
                console.warn('Chapitres indisponibles, utilisation du fallback')
                setChapters(FALLBACK_CHAPTERS)
            } finally {
                setLoading(false)
            }
        }

        if (chaptersUrl) fetchChapters()
    }, [chaptersUrl])

    // Retourne le chapitre correspondant au temps de lecture actuel
    const getCurrentChapter = (): Chapter | null => {
        if (chapters.length === 0) return null
        for (let i = chapters.length - 1; i >= 0; i--) {
            if (currentTime >= timestampToSeconds(chapters[i].timestamp)) {
                return chapters[i]
            }
        }
        return chapters[0]
    }

    const getTitle = (chapter: Chapter): string => {
        switch (lang) {
            case 'fr': return chapter.title_fr
            case 'es': return chapter.title_es
            default: return chapter.title
        }
    }

    const getDescription = (chapter: Chapter): string => {
        switch (lang) {
            case 'fr': return chapter.description_fr
            case 'es': return chapter.description_es
            default: return chapter.description
        }
    }

    const currentChapter = getCurrentChapter()

    if (loading) {
        return (
            <div role="status" aria-live="polite" className="chapter-list-loading">
                Chargement des chapitres...
            </div>
        )
    }

    return (
        <div className="chapter-list-container">
            <button
                className="chapter-dropdown-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-controls="chapter-dropdown-menu"
                aria-label={currentChapter
                    ? `Chapitres — actuellement : chapitre ${currentChapter.chapter}, ${getTitle(currentChapter)}`
                    : 'Chapitres'
                }
            >
                {/* aria-hidden : icône décorative */}
                <span className="chapter-icon" aria-hidden="true">📑</span>
                <span className="chapter-current">
                    {currentChapter ? `Ch. ${currentChapter.chapter}: ${getTitle(currentChapter)}` : 'Chapitres'}
                </span>
                <span className="chapter-arrow" aria-hidden="true">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <div
                    id="chapter-dropdown-menu"
                    className="chapter-dropdown-menu"
                    role="menu"
                    aria-label="Liste des chapitres"
                >
                    {/* Sélecteur de langue */}
                    <div className="chapter-lang-selector" role="group" aria-label="Langue des chapitres">
                        <span className="chapter-lang-label" aria-hidden="true">Langue :</span>
                        <button
                            className={`chapter-lang-btn ${lang === 'fr' ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setLang('fr') }}
                            aria-label="Français"
                            aria-pressed={lang === 'fr'}
                        >
                            <span aria-hidden="true">🇫🇷</span>
                        </button>
                        <button
                            className={`chapter-lang-btn ${lang === 'en' ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setLang('en') }}
                            aria-label="English"
                            aria-pressed={lang === 'en'}
                        >
                            <span aria-hidden="true">🇬🇧</span>
                        </button>
                        <button
                            className={`chapter-lang-btn ${lang === 'es' ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setLang('es') }}
                            aria-label="Español"
                            aria-pressed={lang === 'es'}
                        >
                            <span aria-hidden="true">🇪🇸</span>
                        </button>
                    </div>

                    {/* Liste des chapitres — chaque item est un bouton pour la navigation clavier */}
                    {chapters.map((chapter) => {
                        const isActive = currentChapter?.chapter === chapter.chapter
                        return (
                            <button
                                key={chapter.chapter}
                                className={`chapter-item ${isActive ? 'active' : ''}`}
                                role="menuitem"
                                aria-current={isActive ? 'true' : undefined}
                                onClick={() => {
                                    seek(timestampToSeconds(chapter.timestamp))
                                    setIsPlaying(true)
                                    setIsOpen(false)
                                }}
                            >
                                <div className="chapter-item-header">
                                    <span className="chapter-number">Chapitre {chapter.chapter}</span>
                                    <span className="chapter-timestamp">{chapter.timestamp}</span>
                                </div>
                                <div className="chapter-title">{getTitle(chapter)}</div>
                                <div className="chapter-description">{getDescription(chapter)}</div>
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default ChapterList