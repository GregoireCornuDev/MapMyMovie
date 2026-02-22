export interface Chapter {
    chapter: number
    timestamp: string
    title: string
    title_fr: string
    title_es: string
    description: string
    description_fr: string
    description_es: string
}

// Convertir un timestamp "HH:MM:SS" en secondes
export function timestampToSeconds(timestamp: string): number {
    const parts = timestamp.split(':')
    if (parts.length === 3) {
        const hours = parseInt(parts[0], 10)
        const minutes = parseInt(parts[1], 10)
        const seconds = parseInt(parts[2], 10)
        return hours * 3600 + minutes * 60 + seconds
    }
    return 0
}

// Convertir des secondes en timestamp "HH:MM:SS"
export function secondsToTimestamp(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = Math.floor(totalSeconds % 60)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

