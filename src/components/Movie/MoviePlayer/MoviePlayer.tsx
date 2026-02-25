/// <reference types="vite/client" />
import './MoviePlayer.css'
import { useState, useRef, useEffect } from 'react'
import ReactPlayer from 'react-player'
import ChapterList from './ChapterList/ChapterList'
import AudioDescription from './AudioDescription/AudioDescription'
import { useMovieContext, MovieData } from '../../../context/MovieContext'

interface MoviePlayerProps {
    filmData: MovieData
}

type SubtitleLang = 'fr' | 'en' | 'es' | 'off'

const subtitleLabels: Record<SubtitleLang, string> = {
    fr: '🇫🇷 Français', en: '🇬🇧 English', es: '🇪🇸 Español', off: '❌ Désactivés'
}

function MoviePlayer({ filmData }: MoviePlayerProps) {
    const { setCurrentTime, isPlaying, setIsPlaying, registerSeekHandler, isVideoMuted } = useMovieContext()
    const playerRef = useRef<any>(null)
    const [showSubMenu, setShowSubMenu] = useState(false)
    const [currentSubtitle, setCurrentSubtitle] = useState<SubtitleLang>('fr')

    // Ref pour éviter la boucle infinie onPlay/onPause ↔ isPlaying
    const isPlayingRef = useRef(isPlaying)

    // Ref pour stocker le timeout de pause déclenché par le changement de mute
    const pauseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Quand la lecture démarre, met à jour le contexte
    // et la ref pour éviter les appels redondants
    const handlePlay = () => {
        if (pauseTimeout.current) clearTimeout(pauseTimeout.current)
        if (!isPlayingRef.current) {
            isPlayingRef.current = true
            setIsPlaying(true)
        }
    }

    // Même logique pour la pause
    const handlePause = () => {
        // Ignore les événements pause déclenchés par le changement de mute
        if (playerRef.current?.muted !== isVideoMuted) return

        // Délai pour éviter les pauses intempestives lors de l'activation/désactivation du mute
        /* Ce problème arrive fréquement au cours du développement */
        pauseTimeout.current = setTimeout(() => {
            if (isPlayingRef.current) {
                isPlayingRef.current = false
                setIsPlaying(false)
            }
        }, 200)
    }

    // Enregistre la fonction de seek auprès du contexte pour que les chapitres puissent déplacer la lecture
    useEffect(() => {
        registerSeekHandler((time) => {
            if (playerRef.current) playerRef.current.currentTime = time
        })
    }, [registerSeekHandler])

    // Coupe ou remet le son de la vidéo quand l'audio-description MP3 est active
    useEffect(() => {
        if (playerRef.current) playerRef.current.muted = isVideoMuted
    }, [isVideoMuted])

    // Met à jour le temps de lecture dans le contexte toutes les secondes pendant la lecture
    useEffect(() => {
        if (!isPlaying) return
        const interval = setInterval(() => {
            if (playerRef.current) setCurrentTime(Math.floor(playerRef.current.currentTime))
        }, 1000)
        return () => clearInterval(interval)
    }, [isPlaying, setCurrentTime])

    // Active/désactive la piste de sous-titres correspondant à la langue choisie
    const handleSubtitleChange = (lang: SubtitleLang) => {
        setCurrentSubtitle(lang)
        setShowSubMenu(false)
        const tracks = playerRef.current?.textTracks
        if (!tracks) return
        for (const track of tracks) {
            track.mode = lang !== 'off' && track.language === lang ? 'showing' : 'hidden'
        }
    }

    // Injecte les pistes de sous-titres dans l'élément <video> au montage
    // (config.file n'existe plus dans react-player v3, injection manuelle nécessaire)
    useEffect(() => {
        const video = playerRef.current
        if (!video) return

        // Vérifie si les pistes sont déjà injectées par leur langue
        const existingLangs = Array.from(video.textTracks).map(t => t.language)
        if (existingLangs.includes('fr')) return

        // En dev, les .srt du backend sont bloqués par CORS — utilise les copies locales dans public/mocks/
        //const isDev = import.meta.env.DEV
        const isDev = true // Utilise les sous-titres locaux du fait des problèmes de CORS
        const subtitleSources = {
                fr: isDev ? '/mocks/subtitles-fr.srt' : filmData.subtitles.fr,
                en: isDev ? '/mocks/subtitles-en.srt' : filmData.subtitles.en,
                es: isDev ? '/mocks/subtitles-es.srt' : filmData.subtitles.es,
            }

        ;[
            { src: subtitleSources.fr, srcLang: 'fr', label: 'Français' },
            { src: subtitleSources.en, srcLang: 'en', label: 'English' },
            { src: subtitleSources.es, srcLang: 'es', label: 'Español' },
        ].forEach(({ src, srcLang, label }) => {
            const track = document.createElement('track')
            track.kind = 'subtitles'
            track.src = src
            track.srclang = srcLang
            track.label = label
            video.appendChild(track)
            // Met la piste en hidden pour forcer le chargement sans affichage immédiat
            const textTrack = video.textTracks[video.textTracks.length - 1]
            if (textTrack) textTrack.mode = 'hidden'
        })
        // Délai pour laisser les pistes se charger avant d'activer le français par défaut
        setTimeout(() => handleSubtitleChange('fr'), 3000)
    }, [])

    useEffect(() => {
        console.log('playerRef.current:', playerRef.current)
        console.log('type:', playerRef.current?.constructor?.name)
        const video = playerRef.current
        console.log('textTracks.length:', video?.textTracks.length)
        console.log('textTracks:', video?.textTracks)
    }, [])

    return (
        <div className="movie-player-container">
            {/* Lecteur vidéo — les contrôles natifs sont conservés pour l'accessibilité clavier */}
            <div className="movie-player">
                <ReactPlayer
                    ref={playerRef}
                    src={filmData.film.file_url}
                    controls
                    playing={isPlaying}
                    width="100%"
                    height="100%"
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onError={console.error}
                />
            </div>

            {/* Barre de contrôles personnalisée sous le lecteur */}
            <div
                className="player-controls"
                role="toolbar"
                aria-label="Contrôles du lecteur"
            >
                <ChapterList chaptersUrl={filmData.chapters} />

                {/* Sélecteur de sous-titres */}
                <div className="subtitle-selector">
                    <button
                        className="subtitle-btn"
                        onClick={() => setShowSubMenu(!showSubMenu)}
                        aria-expanded={showSubMenu}
                        aria-controls="subtitle-menu"
                        aria-label={`Sous-titres — actuellement : ${subtitleLabels[currentSubtitle]}`}
                    >
                        {/* aria-hidden : le label du bouton suffit */}
                        <span className="cc-icon" aria-hidden="true">CC</span>
                        <span className="current-lang">{subtitleLabels[currentSubtitle]}</span>
                    </button>

                    {showSubMenu && (
                        <div
                            id="subtitle-menu"
                            className="subtitle-menu"
                            role="menu"
                            aria-label="Choisir la langue des sous-titres"
                        >
                            {(['fr', 'en', 'es', 'off'] as SubtitleLang[]).map(lang => (
                                <button
                                    key={lang}
                                    role="menuitem"
                                    className={currentSubtitle === lang ? 'active' : ''}
                                    aria-current={currentSubtitle === lang ? 'true' : undefined}
                                    onClick={() => handleSubtitleChange(lang)}
                                >
                                    {subtitleLabels[lang]}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <AudioDescription descriptionUrl={filmData["audio-description"]} />
            </div>
        </div>
    )
}

export default MoviePlayer