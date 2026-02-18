import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface FilmData {
    film: {
        file_url: string
        title: string
        synopsis_url: string
        subtitles: {
            en: string
            fr: string
            es: string
        }
        "audio-description": string
        chapters: string
        poi: string
    }
}

interface FilmContextType {
    filmData: FilmData | null
    loading: boolean
    error: string | null
    timestamp: number
}

const FilmContext = createContext<FilmContextType | undefined>(undefined)

export function FilmProvider({ children }: { children: ReactNode }) {
    const [filmData, setFilmData] = useState<FilmData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [timestamp, setTimestamp] = useState(0)

    // Fetch du film au montage
    useEffect(() => {
        const fetchFilm = async () => {
            try {
                const response = await fetch('https://tp-iai3.cleverapps.io/projet/')
                if (!response.ok) throw new Error('Erreur lors du chargement du film')
                const data = await response.json()
                setFilmData(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erreur inconnue')
            } finally {
                setLoading(false)
            }
        }

        fetchFilm()
    }, [])

    // Mise à jour du timestamp chaque seconde
    useEffect(() => {
        const interval = setInterval(() => {
            setTimestamp(prev => prev + 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    return (
        <FilmContext.Provider value={{ filmData, loading, error, timestamp }}>
            {children}
        </FilmContext.Provider>
    )
}

export function useFilm() {
    const context = useContext(FilmContext)
    if (context === undefined) {
        throw new Error('useFilm doit être utilisé à l\'intérieur de FilmProvider')
    }
    return context
}
