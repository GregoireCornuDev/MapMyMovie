import './Movie.css'
import { RefObject } from 'react'
import MovieImage from './MovieImage/MovieImage'
import MoviePlayer from './MoviePlayer/MoviePlayer'
import Synopsis from './Synopsis/Synopsis'
import MovieMap from './MovieMap/MovieMap'
import { MovieData } from '../../context/MovieContext'

interface MovieProps {
    filmData: MovieData
    onWatchNow: () => void
    playerRef: RefObject<HTMLDivElement | null>
}

function Movie({
    filmData,
    onWatchNow,
    playerRef
}: MovieProps) {

    return (
        <div className="movie">
            <MovieImage title={filmData.film.title} onWatchNow={onWatchNow} />
            <Synopsis synopsisUrl={filmData.film.synopsis_url} title="Synopsis" />
            <div ref={playerRef}>
                <MoviePlayer filmData={filmData} />
            </div>
            <MovieMap poiUrl={filmData.poi} />
        </div>
    )
}

export default Movie


