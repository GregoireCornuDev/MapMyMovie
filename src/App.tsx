import MainPage from './pages/MainPage'
import { FilmProvider } from './context/FilmContext'

function App() {
  return (
    <FilmProvider>
      <MainPage />
    </FilmProvider>
  )
}

export default App
