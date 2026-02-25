import { useState, useCallback } from 'react'

export interface MovieTimeState {
    currentTime: number
    setCurrentTime: (time: number) => void
    seek: (time: number) => void
    registerSeekHandler: (handler: (time: number) => void) => void
    isPlaying: boolean
    setIsPlaying: (playing: boolean) => void
    isVideoMuted: boolean
    setIsVideoMuted: (muted: boolean) => void
}

export function useMovieTime(): MovieTimeState {
    const [currentTime, setCurrentTime] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [seekHandler, setSeekHandler] = useState<((time: number) => void) | null>(null)

    // Permet à l'audio-description MP3 de couper le son de la vidéo
    const [isVideoMuted, setIsVideoMuted] = useState(false)

    const seek = useCallback((time: number) => {
        const t = Math.max(0, time)
        seekHandler?.(t)
        setCurrentTime(Math.floor(t))
    }, [seekHandler])

    const registerSeekHandler = useCallback((handler: (time: number) => void) => {
        setSeekHandler(() => handler)
    }, [])

    return { currentTime, setCurrentTime, seek, registerSeekHandler, isPlaying, setIsPlaying, isVideoMuted, setIsVideoMuted }
}