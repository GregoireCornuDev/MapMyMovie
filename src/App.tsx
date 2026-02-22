import MainPage from './pages/MainPage'
import { MovieProvider } from './context/MovieContext'

function App() {
  return (
    <MovieProvider>
      <MainPage />
    </MovieProvider>
  )
}

export default App
