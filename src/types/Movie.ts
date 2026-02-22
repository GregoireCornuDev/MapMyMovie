/**
 * Types et constantes pour les données du film
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

// Données de fallback si le backend est indisponible
export const FALLBACK_MOVIE_DATA: MovieData = {
    film: {
        file_url: "https://upload.wikimedia.org/wikipedia/commons/2/24/Night_of_the_Living_Dead_%281968%29.webm",
        title: "Night of the Living Dead",
        synopsis_url: "https://en.wikipedia.org/wiki/Night_of_the_Living_Dead"
    },
    subtitles: {
        en: "https://tp-iai3.cleverapps.io/projet/subtitles-en.srt",
        fr: "https://tp-iai3.cleverapps.io/projet/subtitles-fr.srt",
        es: "https://tp-iai3.cleverapps.io/projet/subtitles-es.srt"
    },
    "audio-description": "https://tp-iai3.cleverapps.io/projet/description.json",
    chapters: "https://tp-iai3.cleverapps.io/projet/chapters.json",
    poi: "https://tp-iai3.cleverapps.io/projet/poi.json"
}

