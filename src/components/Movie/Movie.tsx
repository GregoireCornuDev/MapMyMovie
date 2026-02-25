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

function Movie({ filmData, onWatchNow, playerRef }: MovieProps) {
    return (
        <article className="movie" aria-label={filmData.film.title}>

            {/* Image d'affiche avec bouton de lancement */}
            <MovieImage title={filmData.film.title} onWatchNow={onWatchNow} />

            {/* Synopsis récupéré depuis Wikipedia */}
            <Synopsis synopsisUrl={filmData.film.synopsis_url} title="Synopsis" />

            {/* Lecteur vidéo — ref utilisée pour le scroll et le lancement */}
            <section ref={playerRef} aria-label="Lecteur vidéo">
                <MoviePlayer filmData={filmData} />
            </section>

            {/* Carte des lieux de tournage */}
            <section aria-label="Carte des lieux de tournage">
                <MovieMap poiUrl={filmData.poi} />
            </section>

        </article>
    )
}

export default Movie