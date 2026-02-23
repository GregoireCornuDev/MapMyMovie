import { useState, useCallback } from 'react'

export interface MovieTimeState {
    currentTime: number
    setCurrentTime: (time: number) => void
    seek: (time: number) => void
    registerSeekHandler: (handler: (time: number) => void) => void
    isPlaying: boolean
    setIsPlaying: (playing: boolean) => void
}

export function useMovieTime(): MovieTimeState {
    const [currentTime, setCurrentTime] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [seekHandler, setSeekHandler] = useState<((time: number) => void) | null>(null)

    const seek = useCallback((time: number) => {
        const t = Math.max(0, time)
        seekHandler?.(t)
        setCurrentTime(Math.floor(t))
    }, [seekHandler])

    const registerSeekHandler = useCallback((handler: (time: number) => void) => {
        setSeekHandler(() => handler)
    }, [])

    return { currentTime, setCurrentTime, seek, registerSeekHandler, isPlaying, setIsPlaying }
}