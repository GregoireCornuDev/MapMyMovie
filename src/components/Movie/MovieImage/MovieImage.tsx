import './MovieImage.css'
import { useState, useEffect } from 'react'

interface MovieImageProps {
    title?: string
    onWatchNow?: () => void
}

function MovieImage({ title = "Film Image", onWatchNow }: MovieImageProps) {
    const [images, setImages] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)

    // Charge les images depuis /img/<nom-du-film>/config.json
    useEffect(() => {
        const loadImages = async () => {
            try {
                const filmBaseName = title.toLowerCase().replace(/\s+/g, '-')
                const response = await fetch(`/img/${filmBaseName}/config.json`)
                if (!response.ok) throw new Error('Fichier de configuration non trouvé')

                const config = await response.json()
                const loadedImages: string[] = []

                if (config.images && Array.isArray(config.images)) {
                    config.images.forEach((imageName: string) => {
                        loadedImages.push(`/img/${filmBaseName}/${imageName}`)
                    })
                }

                setImages(loadedImages.length > 0
                    ? loadedImages
                    : ['https://via.placeholder.com/400x600?text=No+Image']
                )
            } catch {
                // Fallback sur un placeholder si le fichier de config est introuvable
                setImages(['https://via.placeholder.com/400x600?text=No+Image'])
            } finally {
                setLoading(false)
            }
        }

        loadImages()
    }, [title])

    const goToPrevious = () => {
        setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1)
    }

    const goToNext = () => {
        setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1)
    }

    if (loading) return (
        // aria-live="polite" : annoncé aux lecteurs d'écran sans interrompre
        <div role="status" aria-live="polite" className="movie-image">
            Chargement des images...
        </div>
    )

    if (images.length === 0) return <div className="movie-image">Aucune image disponible</div>

    return (
        <div className="movie-image" role="region" aria-label={`Images de ${title}`}>
            <div
                className="image-carousel-container"
                role="group"
                aria-label={`Carrousel — image ${currentIndex + 1} sur ${images.length}`}
            >
                {images.length > 1 && (
                    <button
                        className="carousel-arrow carousel-arrow-left"
                        onClick={goToPrevious}
                        aria-label="Image précédente"
                    >
                        {/* aria-hidden : l'icône est décorative, le label du bouton suffit */}
                        <i className="bi bi-chevron-left" aria-hidden="true"></i>
                    </button>
                )}

                <div className="image-container">
                    <img
                        src={images[currentIndex]}
                        alt={`${title} — image ${currentIndex + 1} sur ${images.length}`}
                        className="image"
                    />
                    {/* Dégradé décoratif, invisible aux lecteurs d'écran */}
                    <div className="image-gradient-mask" aria-hidden="true"></div>

                    <button
                        className="watch-now-button"
                        onClick={onWatchNow}
                        aria-label={`Regarder ${title}`}
                    >
                        {/* alt="" : icône décorative, le texte "Watch now" suffit */}
                        <img src="/icon/watch2.png" alt="" aria-hidden="true" className="watch-now-icon" />
                        <span>Watch now</span>
                    </button>
                </div>

                {images.length > 1 && (
                    <button
                        className="carousel-arrow carousel-arrow-right"
                        onClick={goToNext}
                        aria-label="Image suivante"
                    >
                        <i className="bi bi-chevron-right" aria-hidden="true"></i>
                    </button>
                )}
            </div>
        </div>
    )
}

export default MovieImage