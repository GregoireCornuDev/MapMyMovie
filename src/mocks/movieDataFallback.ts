import { MovieData } from '../types/Movie'

export const FALLBACK_MOVIE_DATA: MovieData = {
    film: {
        file_url: "https://upload.wikimedia.org/wikipedia/commons/2/24/Night_of_the_Living_Dead_%281968%29.webm",
        title: "Night of the Living Dead",
        synopsis_url: "https://en.wikipedia.org/wiki/Night_of_the_Living_Dead"
    },
    subtitles: {
        en: "/mocks/subtitles-en.srt",
        fr: "/mocks/subtitles-fr.srt",
        es: "/mocks/subtitles-es.srt"
    },
    "audio-description": "https://tp-iai3.cleverapps.io/projet/description.json",
    chapters: "https://tp-iai3.cleverapps.io/projet/chapters.json",
    poi: "https://tp-iai3.cleverapps.io/projet/poi.json"
}