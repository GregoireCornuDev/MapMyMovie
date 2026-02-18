import './Movie.css'
import { RefObject } from 'react'
import MovieImage from './MovieImage/MovieImage'
import MoviePlayer from './MoviePlayer/MoviePlayer'
import Synopsis from './Synopsis/Synopsis'
import MovieMap from './MovieMap/MovieMap'
import { FilmData } from '../../context/FilmContext'

interface MovieProps {
    filmData: FilmData
    userName?: string
    userAvatarUrl?: string
    playing: boolean
    currentTime: number
    onPlayingChange: (playing: boolean) => void
    onTimeUpdate: (time: number) => void
    onWatchNow: () => void
    playerRef: RefObject<HTMLDivElement | null>
}

function Movie({
    filmData,
    userName: _userName,
    userAvatarUrl: _userAvatarUrl,
    playing,
    currentTime,
    onPlayingChange,
    onTimeUpdate,
    onWatchNow,
    playerRef
}: MovieProps) {
    return (
        <div className="movie">
            <MovieImage title={filmData.film.title} onWatchNow={onWatchNow} />
            <div ref={playerRef}>
                <MoviePlayer
                    filmData={filmData}
                    playing={playing}
                    onPlayingChange={onPlayingChange}
                    onTimeUpdate={onTimeUpdate}
                />
            </div>
            <Synopsis synopsisUrl={filmData.film.synopsis_url} title="Synopsis" />
            <MovieMap currentTime={currentTime} />
        </div>
    )
}

export default Movie


