import './MoviePlayer.css'
import {useState, useRef, useEffect, useMemo} from 'react'
import ReactPlayer from 'react-player'
import ChapterList from './ChapterList/ChapterList'
import AudioDescription from './AudioDescription/AudioDescription'
import { useMovieContext, MovieData } from '../../../context/MovieContext'

interface MoviePlayerProps {
    filmData: MovieData
}

type SubtitleLang = 'fr' | 'en' | 'es' | 'off'

const subtitleLabels: Record<SubtitleLang, string> = {
    fr: 'Français', en: 'English', es: 'Español', off: 'Désactivés'
}

function MoviePlayer({ filmData }: MoviePlayerProps) {
    const { setCurrentTime, isPlaying, setIsPlaying, registerSeekHandler } = useMovieContext()
    const playerRef = useRef<any>(null)
    const [showSubMenu, setShowSubMenu] = useState(false)
    const [currentSubtitle, setCurrentSubtitle] = useState<SubtitleLang>('fr')

    useEffect(() => {
        registerSeekHandler((time) => {
            if (playerRef.current) playerRef.current.currentTime = time
        })
    }, [registerSeekHandler])

    useEffect(() => {
        if (!isPlaying) return
        const interval = setInterval(() => {
            if (playerRef.current) setCurrentTime(Math.floor(playerRef.current.currentTime))
        }, 1000)
        return () => clearInterval(interval)
    }, [isPlaying, setCurrentTime])

    const handleSubtitleChange = (lang: SubtitleLang) => {
        setCurrentSubtitle(lang)
        setShowSubMenu(false)
        const tracks = playerRef.current?.textTracks
        if (!tracks) return
        for (const track of tracks) {
            track.mode = lang !== 'off' && track.language === lang ? 'showing' : 'hidden'
        }
    }

    const playerConfig = useMemo(() => ({
        file: {
            tracks: [
                { kind: 'subtitles', src: filmData.subtitles.fr, srcLang: 'fr', label: 'Français', default: true },
                { kind: 'subtitles', src: filmData.subtitles.en, srcLang: 'en', label: 'English' },
                { kind: 'subtitles', src: filmData.subtitles.es, srcLang: 'es', label: 'Español' },
            ]
        }
    }), [filmData.subtitles])

    return (
        <div className="movie-player-container">
            <div className="movie-player">
                <ReactPlayer
                    ref={playerRef}
                    url={filmData.film.file_url}
                    controls
                    playing={isPlaying}
                    width="100%"
                    height="100%"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onError={console.error}
                    config={playerConfig}
                />
            </div>

            <div className="player-controls">
                <ChapterList chaptersUrl={filmData.chapters} />

                <div className="subtitle-selector">
                    <button className="subtitle-btn" onClick={() => setShowSubMenu(!showSubMenu)}>
                        <span className="cc-icon">CC</span>
                        <span className="current-lang">{subtitleLabels[currentSubtitle]}</span>
                    </button>
                    {showSubMenu && (
                        <div className="subtitle-menu">
                            {(['fr', 'en', 'es', 'off'] as SubtitleLang[]).map(lang => (
                                <button
                                    key={lang}
                                    className={currentSubtitle === lang ? 'active' : ''}
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