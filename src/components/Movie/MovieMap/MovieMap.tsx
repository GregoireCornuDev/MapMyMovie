import './MovieMap.css'

interface MovieMapProps {
    currentTime?: number
}

function MovieMap({ currentTime = 0 }: MovieMapProps) {
    return (
        <div className="movie-map">
            <div className="movie-map-header">
                <h3>Carte</h3>
                <span className="current-time">{Math.floor(currentTime)}s</span>
            </div>
            <div className="movie-map-content">
                {/* TODO: Intégrer la carte ici */}
                <p>Carte interactive - À implémenter</p>
            </div>
        </div>
    )
}

export default MovieMap

