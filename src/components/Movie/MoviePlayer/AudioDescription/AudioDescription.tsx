import './AudioDescription.css'
import { useState, useEffect, useRef, useCallback } from 'react'
import { SceneDescription } from '../../../../types/AudioDescription'
import { timestampToSeconds } from '../../../../types/Chapter'
import { useMovieContext } from '../../../../context/MovieContext'

// Données de fallback si le backend est indisponible
const FALLBACK_DESCRIPTIONS: SceneDescription[] = [
    {
        scene: 1,
        timestamp: "00:00:00",
        description: "Black and white film. Opening credits appear over a winding country road.",
        description_fr: "Film en noir et blanc. Le générique d'ouverture apparaît sur une route de campagne sinueuse.",
        description_es: "Película en blanco y negro. Los créditos de apertura aparecen sobre un camino rural serpenteante."
    },
    {
        scene: 2,
        timestamp: "00:02:00",
        description: "A car drives through the Pennsylvania countryside. Inside, a young woman and a man.",
        description_fr: "Une voiture traverse la campagne de Pennsylvanie. À l'intérieur, une jeune femme et un homme.",
        description_es: "Un coche atraviesa el campo de Pensilvania. Dentro, una joven y un hombre."
    },
    {
        scene: 3,
        timestamp: "00:05:20",
        description: "The pale-faced man attacks. Johnny tries to fight him off but is thrown against a gravestone.",
        description_fr: "L'homme au visage pâle attaque. Johnny essaie de le repousser mais est projeté contre une pierre tombale.",
        description_es: "El hombre de rostro pálido ataca. Johnny intenta rechazarlo pero es arrojado contra una lápida."
    },
    {
        scene: 4,
        timestamp: "00:10:00",
        description: "Barbara runs through the cemetery, terrified. She reaches an abandoned farmhouse.",
        description_fr: "Barbara court à travers le cimetière, terrifiée. Elle atteint une ferme abandonnée.",
        description_es: "Barbara corre por el cementerio, aterrorizada. Llega a una granja abandonada."
    },
    {
        scene: 5,
        timestamp: "00:20:00",
        description: "Ben arrives at the farmhouse. He starts boarding up the windows and doors.",
        description_fr: "Ben arrive à la ferme. Il commence à condamner les fenêtres et les portes.",
        description_es: "Ben llega a la granja. Comienza a tapiar las ventanas y puertas."
    }
]

interface AudioDescriptionProps {
    descriptionUrl: string
}

type DescLang = 'en' | 'fr' | 'es'

// Mapping des langues pour la synthèse vocale
const SPEECH_LANG_MAP: Record<DescLang, string> = {
    fr: 'fr-FR',
    en: 'en-US',
    es: 'es-ES'
}

function AudioDescription({ descriptionUrl }: AudioDescriptionProps) {
    const { currentTime } = useMovieContext()

    const [descriptions, setDescriptions] = useState<SceneDescription[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [lang, setLang] = useState<DescLang>('fr')
    const [enabled, setEnabled] = useState(false)
    const lastSpokenSceneRef = useRef<number | null>(null)
    const synthRef = useRef<SpeechSynthesis | null>(null)

    // Initialiser la synthèse vocale
    useEffect(() => {
        if ('speechSynthesis' in window) {
            synthRef.current = window.speechSynthesis
        }
        return () => {
            // Arrêter la synthèse vocale si le composant est démonté
            synthRef.current?.cancel()
        }
    }, [])

    // Obtenir la description dans la bonne langue
    const getDescription = useCallback((scene: SceneDescription): string => {
        switch (lang) {
            case 'fr': return scene.description_fr
            case 'es': return scene.description_es
            default: return scene.description
        }
    }, [lang])

    // Fonction pour lire une description à voix haute
    const speakDescription = useCallback((text: string) => {
        if (!synthRef.current) return

        // Arrêter toute lecture en cours
        synthRef.current.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = SPEECH_LANG_MAP[lang]
        utterance.rate = 1.0
        utterance.pitch = 1.0
        utterance.volume = 1.0

        synthRef.current.speak(utterance)
    }, [lang])

    // Arrêter la synthèse vocale quand on désactive
    useEffect(() => {
        if (!enabled && synthRef.current) {
            synthRef.current.cancel()
            lastSpokenSceneRef.current = null
        }
    }, [enabled])

    // Charger les descriptions depuis l'URL
    useEffect(() => {
        const fetchDescriptions = async () => {
            try {
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 3000)

                const response = await fetch(descriptionUrl, { signal: controller.signal })
                clearTimeout(timeoutId)

                if (!response.ok) throw new Error('Erreur')
                const data = await response.json()
                setDescriptions(data)
            } catch {
                console.warn('Descriptions indisponibles, utilisation du fallback')
                setDescriptions(FALLBACK_DESCRIPTIONS)
            } finally {
                setLoading(false)
            }
        }

        if (descriptionUrl) {
            fetchDescriptions()
        }
    }, [descriptionUrl])

    // Fermer le menu quand on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (isOpen && !target.closest('.audio-description-container')) {
                setIsOpen(false)
            }
        }

        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [isOpen])

    // Trouver la scène actuelle basée sur le temps de lecture
    const getCurrentScene = useCallback((): SceneDescription | null => {
        if (descriptions.length === 0) return null

        for (let i = descriptions.length - 1; i >= 0; i--) {
            const sceneTime = timestampToSeconds(descriptions[i].timestamp)
            if (currentTime >= sceneTime) {
                return descriptions[i]
            }
        }
        return descriptions[0]
    }, [descriptions, currentTime])

    const currentScene = getCurrentScene()

    // Détecter le changement de scène et lire la description
    useEffect(() => {
        if (!enabled || !currentScene) return

        // Si c'est une nouvelle scène, la lire
        if (currentScene.scene !== lastSpokenSceneRef.current) {
            lastSpokenSceneRef.current = currentScene.scene
            speakDescription(getDescription(currentScene))
        }
    }, [enabled, currentScene, speakDescription, getDescription])

    if (loading) {
        return <div className="audio-description-loading">Chargement...</div>
    }

    return (
        <div className="audio-description-container">
            <button
                className={`audio-description-toggle ${enabled ? 'enabled' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="ad-icon">AD</span>
                <span className="ad-label">Audio-description</span>
                <span className="ad-arrow">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <div className="audio-description-menu">
                    {/* Activation */}
                    <div className="ad-enable-row">
                        <label className="ad-enable-label">
                            <input
                                type="checkbox"
                                checked={enabled}
                                onChange={(e) => setEnabled(e.target.checked)}
                            />
                            <span>Activer l'audio-description</span>
                        </label>
                    </div>

                    {/* Sélecteur de langue */}
                    <div className="ad-lang-selector">
                        <span className="ad-lang-label">Langue :</span>
                        <button
                            className={`ad-lang-btn ${lang === 'fr' ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setLang('fr') }}
                            title="Français"
                        >
                            🇫🇷
                        </button>
                        <button
                            className={`ad-lang-btn ${lang === 'en' ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setLang('en') }}
                            title="English"
                        >
                            🇬🇧
                        </button>
                        <button
                            className={`ad-lang-btn ${lang === 'es' ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setLang('es') }}
                            title="Español"
                        >
                            🇪🇸
                        </button>
                    </div>

                    {/* Prévisualisation de la scène actuelle */}
                    {currentScene && (
                        <div className="ad-current-scene">
                            <div className="ad-scene-header">
                                <span className="ad-scene-number">Scène {currentScene.scene}</span>
                                <span className="ad-scene-timestamp">{currentScene.timestamp}</span>
                            </div>
                            <p className="ad-scene-text">{getDescription(currentScene)}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Zone accessible pour les lecteurs d'écran - toujours présente mais cachée visuellement */}
            {enabled && currentScene && (
                <div
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    className="sr-only"
                >
                    Scène {currentScene.scene}: {getDescription(currentScene)}
                </div>
            )}
        </div>
    )
}

export default AudioDescription

