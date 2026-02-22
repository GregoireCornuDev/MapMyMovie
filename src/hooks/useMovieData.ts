import { useState, useEffect, useCallback } from 'react'
import { MovieData, FALLBACK_MOVIE_DATA } from '../types/Movie'

export interface MovieDataState {
    filmData: MovieData | null
    loading: boolean
    error: string | null
    title: string
    usingFallback: boolean
    showFallbackModal: boolean
    useMock: () => void
    retryBackend: () => void
}

/**
 * Hook pour gérer les données du film (chargement, fallback, etc.)
 */
export function useMovieData(): MovieDataState {
    const [filmData, setFilmData] = useState<MovieData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [usingFallback, setUsingFallback] = useState(false)
    const [showFallbackModal, setShowFallbackModal] = useState(false)

    // Titre du film (dérivé de filmData)
    const title = filmData?.film.title || ''

    // Fonction pour fetch le backend
    const fetchFilm = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000)

            const response = await fetch('https://tp-iai3.cleverapps.io/projet/', {
                signal: controller.signal
            })
            clearTimeout(timeoutId)

            if (!response.ok) {
                throw new Error('Erreur lors du chargement du film')
            }
            const data = await response.json()
            setFilmData(data)
            setUsingFallback(false)
            setShowFallbackModal(false)
        } catch (err) {
            console.warn('Backend indisponible')
            setShowFallbackModal(true)
        } finally {
            setLoading(false)
        }
    }, [])

    // Utiliser les données mock
    const useMock = useCallback(() => {
        setFilmData(FALLBACK_MOVIE_DATA)
        setUsingFallback(true)
        setShowFallbackModal(false)
        setLoading(false)
    }, [])

    // Réessayer le backend
    const retryBackend = useCallback(() => {
        setShowFallbackModal(false)
        fetchFilm()
    }, [fetchFilm])

    // Fetch au montage
    useEffect(() => {
        fetchFilm()
    }, [fetchFilm])

    return {
        filmData,
        loading,
        error,
        title,
        usingFallback,
        showFallbackModal,
        useMock,
        retryBackend
    }
}

