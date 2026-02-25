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

    // Ref pour stocker le timeout de pause — évite les pauses intempestives lors du seek
    const pauseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Quand la lecture démarre, annule un éventuel pause en attente et met à jour le contexte
    const handlePlay = () => {
        if (pauseTimeout.current) clearTimeout(pauseTimeout.current)
        if (!isPlayingRef.current) {
            isPlayingRef.current = true
            setIsPlaying(true)
        }
    }

    // Délai de 200ms pour ignorer les pauses transitoires lors du seek ou du changement de mute
    const handlePause = () => {
        if (playerRef.current?.muted !== isVideoMuted) return
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
    // Les pistes sont gérées nativement par ReactPlayer v3 via les kind <track>
    const handleSubtitleChange = (lang: SubtitleLang) => {
        setCurrentSubtitle(lang)
        setShowSubMenu(false)
        const tracks = playerRef.current?.textTracks
        if (!tracks) return
        for (const track of tracks) {
            track.mode = lang !== 'off' && track.language === lang ? 'showing' : 'hidden'
        }
    }

    return (
        <div className="movie-player-container">
            {/* Lecteur vidéo — les contrôles natifs sont conservés pour l'accessibilité clavier */}
            {/* Les sous-titres sont injectés via des enfants <track> — syntaxe ReactPlayer v3 */}
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
                >
                    {/* Pistes de sous-titres locales — les fichiers distants sont bloqués par CORS */}
                    {/*
                    <track kind="subtitles" src={filmData.subtitles.fr} srcLang="fr" label="Français" default/>
                    <track kind="subtitles" src={filmData.subtitles.en} srcLang="en" label="English"/>
                    <track kind="subtitles" src={filmData.subtitles.es} srcLang="es" label="Español"/>
                    */}
                    <track kind="subtitles" src="/mocks/subtitles-fr.srt" srcLang="fr" label="Français"/>
                    <track kind="subtitles" src="/mocks/subtitles-en.srt" srcLang="en" label="English"/>
                    <track kind="subtitles" src="/mocks/subtitles-es.srt" srcLang="es" label="Español"/>
                </ReactPlayer>
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