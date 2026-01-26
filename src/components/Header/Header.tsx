import './Header.css'

function Header({ movieTitle }) {
    return (
        <header className="header">
            <h1 className="app-title">MapMyMovie</h1>
            {movieTitle && <span className="movie-title">{movieTitle}</span>}
        </header>
    )
}

export default Header
