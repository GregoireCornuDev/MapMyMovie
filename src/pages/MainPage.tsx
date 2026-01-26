import './MainPage.css'
import Header from '../components/Header/Header'
import Film from '../components/Film/Film'
import Discussion from '../components/Discussion/Discussion'

function MainPage() {
    const movieTitle = "La nuit des morts vivants (1968)"

    return (
        <div className="main-page">
            <Header movieTitle={movieTitle} />
            <div className="content">
                <Film title={movieTitle} />
                <Discussion />
            </div>
        </div>
    )
}

export default MainPage
