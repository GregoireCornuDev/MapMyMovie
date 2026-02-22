import './ChapterList.css'
import { useState, useEffect } from 'react'
import { Chapter, timestampToSeconds } from '../../../../types/Chapter'
import { useMovieContext } from '../../../../context/MovieContext'

// Chapitres de fallback si le backend est indisponible
const FALLBACK_CHAPTERS: Chapter[] = [
    {
        chapter: 1,
        timestamp: "00:00:00",
        title: "The Cemetery",
        title_fr: "Le Cimetière",
        title_es: "El Cementerio",
        description: "Barbara and Johnny visit their father's grave in a remote Pennsylvania cemetery.",
        description_fr: "Barbara et Johnny visitent la tombe de leur père dans un cimetière isolé de Pennsylvanie.",
        description_es: "Barbara y Johnny visitan la tumba de su padre en un cementerio remoto de Pensilvania."
    },
    {
        chapter: 2,
        timestamp: "00:09:30",
        title: "The Farmhouse",
        title_fr: "La Ferme",
        title_es: "La Granja",
        description: "Barbara finds refuge in an isolated farmhouse.",
        description_fr: "Barbara trouve refuge dans une ferme isolée.",
        description_es: "Barbara encuentra refugio en una granja aislada."
    },
    {
        chapter: 3,
        timestamp: "00:20:00",
        title: "Barricading and News Reports",
        title_fr: "Barricades et Bulletins d'Information",
        title_es: "Barricadas y Noticias",
        description: "Ben takes charge, boarding up windows and doors.",
        description_fr: "Ben prend les choses en main, condamnant les fenêtres et les portes.",
        description_es: "Ben toma el mando, tapiando ventanas y puertas."
    },
    {
        chapter: 4,
        timestamp: "00:32:00",
        title: "The Cellar Dwellers Revealed",
        title_fr: "Les Occupants de la Cave Révélés",
        title_es: "Los Habitantes del Sótano Revelados",
        description: "Harry Cooper and others emerge from the cellar.",
        description_fr: "Harry Cooper et les autres sortent de la cave.",
        description_es: "Harry Cooper y otros emergen del sótano."
    },
    {
        chapter: 5,
        timestamp: "00:45:00",
        title: "The Plan",
        title_fr: "Le Plan",
        title_es: "El Plan",
        description: "The group devises a plan to refuel the truck and escape.",
        description_fr: "Le groupe élabore un plan pour faire le plein du camion et s'échapper.",
        description_es: "El grupo idea un plan para repostar el camión y escapar."
    },
    {
        chapter: 6,
        timestamp: "01:00:00",
        title: "The Failed Escape",
        title_fr: "L'Évasion Ratée",
        title_es: "El Escape Fallido",
        description: "The escape attempt goes tragically wrong.",
        description_fr: "La tentative d'évasion tourne tragiquement mal.",
        description_es: "El intento de escape sale trágicamente mal."
    },
    {
        chapter: 7,
        timestamp: "01:15:00",
        title: "The Final Siege",
        title_fr: "Le Siège Final",
        title_es: "El Asedio Final",
        description: "The ghouls breach the farmhouse defenses.",
        description_fr: "Les goules franchissent les défenses de la ferme.",
        description_es: "Los necrófagos rompen las defensas de la granja."
    },
    {
        chapter: 8,
        timestamp: "01:25:00",
        title: "Dawn and Rescue",
        title_fr: "L'Aube et le Sauvetage",
        title_es: "El Amanecer y el Rescate",
        description: "Morning comes with a devastating conclusion.",
        description_fr: "Le matin arrive avec une conclusion dévastatrice.",
        description_es: "La mañana llega con una conclusión devastadora."
    }
]

interface ChapterListProps {
    chaptersUrl: string
}

type ChapterLang = 'en' | 'fr' | 'es'

function ChapterList({ chaptersUrl }: ChapterListProps) {
    // Utiliser le context partagé du film pour accéder au temps et aux fonctions de seek
    const { currentTime, seek, setIsPlaying } = useMovieContext()

    const [chapters, setChapters] = useState<Chapter[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [lang, setLang] = useState<ChapterLang>('fr')

    // Fermer le menu quand on clique ailleurs
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

    // Charger les chapitres depuis l'URL
    useEffect(() => {
        const fetchChapters = async () => {
            try {
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 3000)

                const response = await fetch(chaptersUrl, { signal: controller.signal })
                clearTimeout(timeoutId)

                if (!response.ok) throw new Error('Erreur lors du chargement des chapitres')
                const data = await response.json()
                setChapters(data)
            } catch (err) {
                console.warn('Chapitres indisponibles, utilisation du fallback')
                setChapters(FALLBACK_CHAPTERS)
                setError(null)
            } finally {
                setLoading(false)
            }
        }

        if (chaptersUrl) {
            fetchChapters()
        }
    }, [chaptersUrl])

    // Trouver le chapitre actuel basé sur le temps de lecture
    const getCurrentChapter = (): Chapter | null => {
        if (chapters.length === 0) return null

        for (let i = chapters.length - 1; i >= 0; i--) {
            const chapterTime = timestampToSeconds(chapters[i].timestamp)
            if (currentTime >= chapterTime) {
                return chapters[i]
            }
        }
        return chapters[0]
    }

    // Obtenir le titre dans la bonne langue
    const getTitle = (chapter: Chapter): string => {
        switch (lang) {
            case 'fr': return chapter.title_fr
            case 'es': return chapter.title_es
            default: return chapter.title
        }
    }

    // Obtenir la description dans la bonne langue
    const getDescription = (chapter: Chapter): string => {
        switch (lang) {
            case 'fr': return chapter.description_fr
            case 'es': return chapter.description_es
            default: return chapter.description
        }
    }

    const currentChapter = getCurrentChapter()

    if (loading) {
        return <div className="chapter-list-loading">Chargement des chapitres...</div>
    }

    if (error) {
        return <div className="chapter-list-error">Erreur: {error}</div>
    }

    return (
        <div className="chapter-list-container">
            <button
                className="chapter-dropdown-toggle"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="chapter-icon">📑</span>
                <span className="chapter-current">
                    {currentChapter ? `Ch. ${currentChapter.chapter}: ${getTitle(currentChapter)}` : 'Chapitres'}
                </span>
                <span className="chapter-arrow">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <div className="chapter-dropdown-menu">
                    {/* Sélecteur de langue */}
                    <div className="chapter-lang-selector">
                        <span className="chapter-lang-label">Langue :</span>
                        <button
                            className={`chapter-lang-btn ${lang === 'fr' ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setLang('fr') }}
                            title="Français"
                        >
                            🇫🇷
                        </button>
                        <button
                            className={`chapter-lang-btn ${lang === 'en' ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setLang('en') }}
                            title="English"
                        >
                            🇬🇧
                        </button>
                        <button
                            className={`chapter-lang-btn ${lang === 'es' ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setLang('es') }}
                            title="Español"
                        >
                            🇪🇸
                        </button>
                    </div>

                    {/* Liste des chapitres */}
                    {chapters.map((chapter) => {
                        const isActive = currentChapter?.chapter === chapter.chapter
                        return (
                            <div
                                key={chapter.chapter}
                                className={`chapter-item ${isActive ? 'active' : ''}`}
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
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default ChapterList
