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

    useEffect(() => {
        // Charger les images du film depuis config.json
        const loadImages = async () => {
            try {
                // Créer le nom de base du film (remplacer les espaces par des tirets et mettre en minuscules)
                const filmBaseName = title.toLowerCase().replace(/\s+/g, '-')

                // Charger le fichier de configuration
                const response = await fetch(`/img/${filmBaseName}/config.json`)

                if (!response.ok) {
                    throw new Error('Fichier de configuration non trouvé')
                }

                const config = await response.json()
                const loadedImages: string[] = []

                // Charger toutes les images listées dans config.json
                if (config.images && Array.isArray(config.images)) {
                    config.images.forEach((imageName: string) => {
                        loadedImages.push(`/img/${filmBaseName}/${imageName}`)
                    })
                }

                // Si aucune image trouvée, ajouter un placeholder
                if (loadedImages.length === 0) {
                    loadedImages.push('https://via.placeholder.com/400x600?text=No+Image')
                }

                setImages(loadedImages)
            } catch (err) {
                // En cas d'erreur, utiliser un placeholder
                setImages(['https://via.placeholder.com/400x600?text=No+Image'])
            } finally {
                setLoading(false)
            }
        }

        loadImages()
    }, [title])

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        )
    }

    const goToNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        )
    }

    if (loading) {
        return <div className="movie-image">Chargement des images...</div>
    }

    if (images.length === 0) {
        return <div className="movie-image">Aucune image disponible</div>
    }

    return (
        <div className="movie-image">
            <div className="image-carousel-container">
                {/* Flèche gauche */}
                {images.length > 1 && (
                    <button
                        className="carousel-arrow carousel-arrow-left"
                        onClick={goToPrevious}
                        aria-label="Image précédente"
                    >
                        <i className="bi bi-chevron-left"></i>
                    </button>
                )}

                {/* Image */}
                <div className="image-container">
                    <img
                        src={images[currentIndex]}
                        alt={`${title} - ${currentIndex + 1}`}
                        className="image"
                    />
                    <div className="image-gradient-mask"></div>

                    {/* Bouton Watch Now */}
                    <button className="watch-now-button" onClick={onWatchNow}>
                        <img src="/icon/watch2.png" alt="Play" className="watch-now-icon" />
                        <span>Watch now</span>
                    </button>
                </div>

                {/* Flèche droite */}
                {images.length > 1 && (
                    <button
                        className="carousel-arrow carousel-arrow-right"
                        onClick={goToNext}
                        aria-label="Image suivante"
                    >
                        <i className="bi bi-chevron-right"></i>
                    </button>
                )}
            </div>
        </div>
    )
}

export default MovieImage
