import './AudioDescription.css'
import { useState, useEffect, useRef, useCallback } from 'react'
import { SceneDescription } from '../../../../types/AudioDescription'
import { timestampToSeconds } from '../../../../types/Chapter'
import { useMovieContext } from '../../../../context/MovieContext'
import { FALLBACK_DESCRIPTIONS } from '../../../../mocks/audioDescriptionFallback.ts'

interface AudioDescriptionProps {
    descriptionUrl: string
}

type DescLang = 'en' | 'fr' | 'es'

// Codes langue pour la synthèse vocale Web Speech API
const SPEECH_LANG_MAP: Record<DescLang, string> = {
    fr: 'fr-FR',
    en: 'en-US',
    es: 'es-ES'
}

// Seul le MP3 anglais est disponible — FR et ES sont grisés
const MP3_SOURCES: Partial<Record<DescLang, string>> = {
    en: '/mocks/audio-description-en.mp3'
}

function AudioDescription({ descriptionUrl }: AudioDescriptionProps) {
    const { currentTime, isPlaying, setIsVideoMuted } = useMovieContext()

    const [descriptions, setDescriptions] = useState<SceneDescription[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [lang, setLang] = useState<DescLang>('fr')
    const [enabled, setEnabled] = useState(false)

    // État du lecteur MP3
    const [mp3Lang, setMp3Lang] = useState<DescLang>('en')
    const [mp3Playing, setMp3Playing] = useState(false)
    const [mp3Volume, setMp3Volume] = useState(1)
    const mp3Ref = useRef<HTMLAudioElement | null>(null)

    const lastSpokenSceneRef = useRef<number | null>(null)
    const synthRef = useRef<SpeechSynthesis | null>(null)

    // Initialise la synthèse vocale si disponible dans le navigateur
    useEffect(() => {
        if ('speechSynthesis' in window) synthRef.current = window.speechSynthesis
        return () => { synthRef.current?.cancel() }
    }, [])

    // Initialise l'élément audio MP3
    useEffect(() => {
        mp3Ref.current = new Audio()
        mp3Ref.current.onended = () => setMp3Playing(false)
        return () => {
            mp3Ref.current?.pause()
            mp3Ref.current = null
        }
    }, [])

    // Synchronise le volume du MP3 avec le curseur
    useEffect(() => {
        if (mp3Ref.current) mp3Ref.current.volume = mp3Volume
    }, [mp3Volume])

    // Pause/reprise du MP3 liée à isPlaying du film
    useEffect(() => {
        const audio = mp3Ref.current
        if (!audio || !mp3Playing) return
        if (isPlaying) {
            audio.play()
        } else {
            audio.pause()
        }
    }, [isPlaying, mp3Playing])

    // Synchronise le timecode du MP3 avec celui du film
    useEffect(() => {
        const audio = mp3Ref.current
        if (!audio || !mp3Playing) return
        // Ne seek que si l'écart est significatif (> 2s) pour éviter les micro-corrections
        if (audio.duration && currentTime <= audio.duration) {
            if (Math.abs(audio.currentTime - currentTime) > 2) {
                audio.currentTime = currentTime
            }
        }
    }, [currentTime, mp3Playing])

    // Lance ou arrête le MP3 et le positionne au timecode actuel du film
    const toggleMp3 = () => {
        const audio = mp3Ref.current
        const src = MP3_SOURCES[mp3Lang]
        if (!audio || !src) return

        if (mp3Playing) {
            audio.pause()
            setMp3Playing(false)
            // Remet le son de la vidéo
            setIsVideoMuted(false)
        } else {
            audio.src = src
            audio.volume = mp3Volume
            audio.currentTime = currentTime
            setIsVideoMuted(true) // Coupe le son de la vidéo
            setTimeout(() => {
                audio.play()
                setMp3Playing(true)
            }, 2000)
        }
    }

    const getDescription = useCallback((scene: SceneDescription): string => {
        switch (lang) {
            case 'fr': return scene.description_fr
            case 'es': return scene.description_es
            default: return scene.description
        }
    }, [lang])

    const speakDescription = useCallback((text: string) => {
        if (!synthRef.current) return
        synthRef.current.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = SPEECH_LANG_MAP[lang]
        utterance.rate = 1.0
        utterance.pitch = 1.0
        utterance.volume = 1.0
        synthRef.current.speak(utterance)
    }, [lang])

    // Arrête la synthèse vocale quand on désactive l'audio-description
    useEffect(() => {
        if (!enabled && synthRef.current) {
            synthRef.current.cancel()
            lastSpokenSceneRef.current = null
        }
    }, [enabled])

    // Charge les descriptions depuis le backend, avec fallback si indisponible
    useEffect(() => {
        const fetchDescriptions = async () => {
            try {
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 3000)
                const response = await fetch(descriptionUrl, { signal: controller.signal })
                clearTimeout(timeoutId)
                if (!response.ok) throw new Error('Erreur')
                setDescriptions(await response.json())
            } catch {
                console.warn('Descriptions indisponibles, utilisation du fallback')
                setDescriptions(FALLBACK_DESCRIPTIONS)
            } finally {
                setLoading(false)
            }
        }
        if (descriptionUrl) fetchDescriptions()
    }, [descriptionUrl])

    // Ferme le menu si on clique en dehors
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (isOpen && !target.closest('.audio-description-container')) setIsOpen(false)
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [isOpen])

    const getCurrentScene = useCallback((): SceneDescription | null => {
        if (descriptions.length === 0) return null
        for (let i = descriptions.length - 1; i >= 0; i--) {
            if (currentTime >= timestampToSeconds(descriptions[i].timestamp)) return descriptions[i]
        }
        return descriptions[0]
    }, [descriptions, currentTime])

    const currentScene = getCurrentScene()

    // Lit la description synthétisée quand la scène change
    useEffect(() => {
        if (!enabled || !currentScene) return
        if (currentScene.scene !== lastSpokenSceneRef.current) {
            lastSpokenSceneRef.current = currentScene.scene
            speakDescription(getDescription(currentScene))
        }
    }, [enabled, currentScene, speakDescription, getDescription])

    if (loading) {
        return <div role="status" aria-live="polite" className="audio-description-loading">Chargement...</div>
    }

    return (
        <div className="audio-description-container">
            <button
                className={`audio-description-toggle ${enabled ? 'enabled' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-controls="audio-description-menu"
                aria-label={`Audio-description ${enabled ? 'activée' : 'désactivée'}`}
            >
                <span className="ad-icon" aria-hidden="true">AD</span>
                <span className="ad-label">Audio-description</span>
                <span className="ad-arrow" aria-hidden="true">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <div
                    id="audio-description-menu"
                    className="audio-description-menu"
                    role="region"
                    aria-label="Options d'audio-description"
                >
                    {/* Section MP3 */}
                    <div className="ad-mp3-section">
                        <div className="ad-lang-selector" role="group" aria-label="Langue de la piste MP3">
                            <span className="ad-lang-label" aria-hidden="true">Piste audio :</span>
                            {(['fr', 'en', 'es'] as DescLang[]).map(l => (
                                <button
                                    key={l}
                                    className={`ad-lang-btn ${mp3Lang === l ? 'active' : ''} ${!MP3_SOURCES[l] ? 'disabled' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (MP3_SOURCES[l]) setMp3Lang(l)
                                    }}
                                    aria-label={l === 'fr' ? 'Français' : l === 'en' ? 'English' : 'Español'}
                                    aria-pressed={mp3Lang === l}
                                    disabled={!MP3_SOURCES[l]}
                                    aria-disabled={!MP3_SOURCES[l]}
                                >
                                    <span aria-hidden="true">{l === 'fr' ? '🇫🇷' : l === 'en' ? '🇬🇧' : '🇪🇸'}</span>
                                </button>
                            ))}

                            {/* Curseur de volume */}
                            <input
                                type="range"
                                className="ad-volume"
                                min={0}
                                max={1}
                                step={0.05}
                                value={mp3Volume}
                                onChange={(e) => setMp3Volume(Number(e.target.value))}
                                aria-label="Volume de la piste audio"
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={Math.round(mp3Volume * 100)}
                                aria-valuetext={`Volume : ${Math.round(mp3Volume * 100)}%`}
                                title={`Volume : ${Math.round(mp3Volume * 100)}%`}
                            />
                        </div>

                        {/* Bouton lecture/arrêt MP3 */}
                        <button
                            className={`ad-mp3-btn ${mp3Playing ? 'playing' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleMp3()
                            }}
                            aria-label={mp3Playing ? 'Arrêter la piste audio' : 'Lire la piste audio'}
                            aria-pressed={mp3Playing}
                        >
                            <span aria-hidden="true">{mp3Playing ? '🔇' : '🔊'}</span>
                            <span>{mp3Playing ? 'Arrêter' : 'Lire la piste audio'}</span>
                        </button>
                    </div>

                    <div className="ad-separator" aria-hidden="true"/>

                    {/* Section synthèse vocale */}
                    <div className="ad-enable-row">
                        <label className="ad-enable-label">
                            <input
                                type="checkbox"
                                checked={enabled}
                                onChange={(e) => setEnabled(e.target.checked)}
                                aria-describedby="ad-current-scene"
                            />
                            <span>Activer l'audio-description</span>
                        </label>
                    </div>

                    <div className="ad-lang-selector" role="group" aria-label="Langue de l'audio-description">
                        <span className="ad-lang-label" aria-hidden="true">Langue :</span>
                        <button
                            className={`ad-lang-btn ${lang === 'fr' ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setLang('fr') }}
                            aria-label="Français" aria-pressed={lang === 'fr'}
                        >
                            <span aria-hidden="true">🇫🇷</span>
                        </button>
                        <button
                            className={`ad-lang-btn ${lang === 'en' ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setLang('en') }}
                            aria-label="English" aria-pressed={lang === 'en'}
                        >
                            <span aria-hidden="true">🇬🇧</span>
                        </button>
                        <button
                            className={`ad-lang-btn ${lang === 'es' ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setLang('es') }}
                            aria-label="Español" aria-pressed={lang === 'es'}
                        >
                            <span aria-hidden="true">🇪🇸</span>
                        </button>
                    </div>

                    {currentScene && (
                        <div id="ad-current-scene" className="ad-current-scene" aria-live="polite">
                            <div className="ad-scene-header">
                                <span className="ad-scene-number">Scène {currentScene.scene}</span>
                                <span className="ad-scene-timestamp">{currentScene.timestamp}</span>
                            </div>
                            <p className="ad-scene-text">{getDescription(currentScene)}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Zone annoncée aux lecteurs d'écran à chaque changement de scène, cachée visuellement */}
            {enabled && currentScene && (
                <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
                    Scène {currentScene.scene}: {getDescription(currentScene)}
                </div>
            )}
        </div>
    )
}

export default AudioDescription