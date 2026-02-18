import './MoviePlayer.css'
import React from 'react'
import ReactPlayer from 'react-player'

interface FilmData {
    film: {
        file_url: string
        title: string
        synopsis_url: string
        subtitles: {
            en: string
            fr: string
            es: string
        }
        "audio-description": string
        chapters: string
        poi: string
    }
}

interface MoviePlayerProps {
    filmData: FilmData
    playing?: boolean
    onPlayingChange?: (playing: boolean) => void
    onTimeUpdate?: (time: number) => void
}

const MoviePlayer = React.memo(function MoviePlayer({ filmData, playing = false, onPlayingChange, onTimeUpdate }: MoviePlayerProps) {
    const PlayerComponent = ReactPlayer as any

    const handlePlay = () => {
        onPlayingChange?.(true)
    }

    const handlePause = () => {
        onPlayingChange?.(false)
    }

    const handleProgress = (state: { playedSeconds: number }) => {
        onTimeUpdate?.(state.playedSeconds)
    }

    return (
        <div className="movie-player-container">
            <div className="movie-player">
                <PlayerComponent
                    src={filmData.film.file_url}
                    controls
                    playing={playing}
                    width="100%"
                    height="100%"
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onProgress={handleProgress}
                    progressInterval={500}
                    onError={(e: any) => console.error('Erreur lecteur:', e)}
                />
            </div>
        </div>
    )
}, (prevProps, nextProps) => {
    // Ne re-rendre que si l'URL du film ou playing change
    return prevProps.filmData.film.file_url === nextProps.filmData.film.file_url &&
           prevProps.playing === nextProps.playing
})

export default MoviePlayer
