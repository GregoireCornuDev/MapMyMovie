import './Header.css'

interface HeaderProps {
    movieTitle?: string
}

function Header({ movieTitle }: HeaderProps) {
    return (
        // role="banner" est implicite sur <header> mais explicite ici pour clarté
        <header className="header" role="banner">
            {/* Logo de l'application — alt descriptif pour les lecteurs d'écran */}
            <img src="/icon/mapmymovie.png" alt="MapMyMovie" className="app-logo" />

            {/* Titre du film affiché uniquement si disponible */}
            {movieTitle && (
                <span className="movie-title" aria-label={`Film en cours : ${movieTitle}`}>
                    {movieTitle}
                </span>
            )}
        </header>
    )
}

export default Header