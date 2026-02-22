import './MainPage.css'
import { useState, useRef } from 'react'
import Header from '../components/Header/Header'
import Movie from '../components/Movie/Movie'
import Discuss from '../components/Discuss/Discussion'
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

    const [userName, setUserName] = useState("Who are you ?")
    const [userAvatarUrl, setUserAvatarUrl] = useState("/avatar/zombi.png")
    const playerRef = useRef<HTMLDivElement>(null)

    const movieTitle = filmData?.film.title || "La nuit des morts vivants (1968)"

    const handleIdentityChange = (name: string, avatarUrl: string) => {
        setUserName(name)
        setUserAvatarUrl(avatarUrl)
    }

    const handleWatchNow = () => {
        // Scroll jusqu'au lecteur
        playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Lancer la lecture après un court délai pour laisser le scroll s'achever.
        // On choisit 900ms comme délai raisonnable et simple.
        setTimeout(() => {
            setIsPlaying(true)
        }, 900)
    }

    return (
        <div className="main-page">
            {/* Modale si le backend est indisponible */}
            <FallbackModal
                show={showFallbackModal}
                onUseMock={useMock}
                onRetry={retryBackend}
            />

            <div className="content-container">
                <div className="content-row">
                    {/* Colonne gauche : Header + Poster + Film + Carte */}
                    <div className="left-column">
                        <div className="header-overlay">
                            <Header movieTitle={movieTitle} />
                        </div>
                        {loading && <div>Chargement...</div>}
                        {error && <div>Erreur : {error}</div>}
                        {filmData && (
                            <Movie
                                filmData={filmData}
                                onWatchNow={handleWatchNow}
                                playerRef={playerRef}
                            />
                        )}
                    </div>

                    {/* Colonne droite : Discussion */}
                    <div className="right-column">
                        <Discuss
                            userName={userName}
                            userAvatarUrl={userAvatarUrl}
                            onIdentityChange={handleIdentityChange}
                            currentTime={currentTime}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MainPage
