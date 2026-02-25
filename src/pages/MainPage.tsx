import './MainPage.css'
import { useState, useRef, useEffect } from 'react'
import Header from '../components/Header/Header'
import Movie from '../components/Movie/Movie'
import Discuss from '../components/Discussion/Discussion'
import { useMovieContext } from '../context/MovieContext'
import FallbackModal from '../components/FallbackModal/FallbackModal'

function MainPage() {
    const {
        filmData,
        loading,
        error,
        showFallbackModal,
        useMock,
        retryBackend,
        currentTime,
        setIsPlaying
    } = useMovieContext()

    const [userName, setUserName] = useState(
        localStorage.getItem('identity_name') || "Who are you ?"
    )
    const playerRef = useRef<HTMLDivElement>(null)
    const leftColumnRef = useRef<HTMLDivElement>(null)

    // Repositionne la colonne gauche en haut à l'arrivée sur la page
    useEffect(() => {
        leftColumnRef.current?.scrollTo(0, 0)
    }, [])

    const movieTitle = filmData?.film.title || "La nuit des morts vivants (1968)"

    // Met à jour le nom d'utilisateur quand l'identité change
    const handleIdentityChange = (name: string, _avatarUrl: string) => {
        setUserName(name)
    }

    // Scrolle jusqu'au lecteur et lance la lecture
    const handleWatchNow = () => {
        playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => setIsPlaying(true), 900)
    }

    return (
        // role="application" indique aux lecteurs d'écran que c'est une app interactive
        <div className="main-page" role="application" aria-label={movieTitle}>

            <FallbackModal
                show={showFallbackModal}
                onUseMock={useMock}
                onRetry={retryBackend}
            />

            <div className="content-container">
                <div className="content-row">
                    {/* Colonne principale : contenu du film */}
                    <main className="left-column" ref={leftColumnRef} aria-label="Contenu principal">
                        <div className="header-overlay">
                            <Header movieTitle={movieTitle} />
                        </div>
                        {loading && <div role="status" aria-live="polite">Chargement...</div>}
                        {error && <div role="alert">{error}</div>}
                        {filmData && (
                            <Movie
                                filmData={filmData}
                                onWatchNow={handleWatchNow}
                                playerRef={playerRef}
                            />
                        )}
                    </main>

                    {/* Colonne secondaire : discussion */}
                    <aside className="right-column" aria-label="Discussion">
                        <Discuss
                            wsUrl="wss://tp-iai3.cleverapps.io/"
                            userName={userName}
                            onIdentityChange={handleIdentityChange}
                            currentTime={currentTime}
                        />
                    </aside>
                </div>
            </div>
        </div>
    )
}

export default MainPage