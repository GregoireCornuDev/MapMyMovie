import './Header.css'

interface HeaderProps {
    movieTitle?: string
}

function Header({ movieTitle }: HeaderProps) {
    return (
        <header className="header">
            <img src="/icon/mapmymovie.png" alt="MapMyMovie" className="app-logo"/>
            {movieTitle && <span className="movie-title">{movieTitle}</span>}
        </header>
    )
}

export default Header
