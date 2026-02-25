/**
 * Types pour les données du film
 */
export interface MovieData {
    film: {
        file_url: string
        title: string
        synopsis_url: string
    }
    subtitles: {
        en: string
        fr: string
        es: string
    }
    "audio-description": string
    chapters: string
    poi: string
}

