import './MainPage.css'
import { useState, useRef } from 'react'
import Header from '../components/Header/Header'
import Movie from '../components/Movie/Movie'
import Discuss from '../components/Discuss/Discussion'
import { useFilm } from '../context/FilmContext'

function MainPage() {
    const { filmData, loading, error } = useFilm()
    const [userName, setUserName] = useState("Who are you ?")
    const [userAvatarUrl, setUserAvatarUrl] = useState("/avatar/zombi.png")

    // États partagés pour la lecture vidéo
    const [playing, setPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const playerRef = useRef<HTMLDivElement>(null)

    const movieTitle = filmData?.film.title || "La nuit des morts vivants (1968)"

    const handleIdentityChange = (name: string, avatarUrl: string) => {
        setUserName(name)
        setUserAvatarUrl(avatarUrl)
    }

    const handleWatchNow = () => {
        // Scroll jusqu'au lecteur
        playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Lancer la lecture après un petit délai pour le scroll
        setTimeout(() => {
            setPlaying(true)
        }, 500)
    }

    return (
        <div className="main-page">
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
                                userName={userName}
                                userAvatarUrl={userAvatarUrl}
                                playing={playing}
                                currentTime={currentTime}
                                onPlayingChange={setPlaying}
                                onTimeUpdate={setCurrentTime}
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
