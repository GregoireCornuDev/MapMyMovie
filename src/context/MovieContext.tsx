import { createContext, useContext, ReactNode } from 'react'
import { useMovieData, MovieDataState } from '../hooks/useMovieData'
import { useMovieTime, MovieTimeState } from '../hooks/useMovieTime'

export type { MovieData } from '../types/Movie'
export { FALLBACK_MOVIE_DATA } from '../mocks/movieDataFallback'

type MovieContextType = MovieDataState & MovieTimeState

const MovieContext = createContext<MovieContextType>({} as MovieContextType)

export function MovieProvider({ children }: { children: ReactNode }) {
    return (
        <MovieContext.Provider value={{ ...useMovieData(), ...useMovieTime() }}>
            {children}
        </MovieContext.Provider>
    )
}

export const useMovieContext = () => useContext(MovieContext)