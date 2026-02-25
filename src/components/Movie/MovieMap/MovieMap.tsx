import './MovieMap.css'
import { useMovieContext } from '../../../context/MovieContext'
import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix des icônes Leaflet qui ne se chargent pas correctement avec Vite
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

type Lang = 'en' | 'fr' | 'es'

const LANG_FLAGS: Record<Lang, string> = { en: '🇬🇧', fr: '🇫🇷', es: '🇪🇸' }
const LANG_LABELS: Record<Lang, string> = { en: 'English', fr: 'Français', es: 'Español' }

interface Timestamp {
    time: string
    scene: string
    scene_fr: string
    scene_es: string
}

interface Poi {
    id: number
    title: string
    title_fr: string
    title_es: string
    latitude: number
    longitude: number
    description: string
    timestamps: Timestamp[]
}

interface MovieMapProps {
    poiUrl: string
}

function timestampToSeconds(time: string): number {
    const [h, m, s] = time.split(':').map(Number)
    return h * 3600 + m * 60 + s
}

// Retourne le POI dont le timestamp est le plus proche du temps actuel sans le dépasser
function getActivePoi(pois: Poi[], currentTime: number): { poi: Poi, ts: Timestamp } | null {
    let active: { poi: Poi, ts: Timestamp } | null = null
    let closestTime = -1

    for (const poi of pois) {
        if (!poi.timestamps) continue
        for (const ts of poi.timestamps) {
            const t = timestampToSeconds(ts.time)
            if (t <= currentTime && t > closestTime) {
                closestTime = t
                active = { poi, ts }
            }
        }
    }
    return active
}

function getTitle(poi: Poi, lang: Lang): string {
    if (lang === 'fr') return poi.title_fr
    if (lang === 'es') return poi.title_es
    return poi.title
}

function getScene(ts: Timestamp, lang: Lang): string {
    if (lang === 'fr') return ts.scene_fr
    if (lang === 'es') return ts.scene_es
    return ts.scene
}

// Recentre la carte sur le POI actif à chaque changement
function MapController({ poi }: { poi: Poi | null }) {
    const map = useMap()
    useEffect(() => {
        if (poi) map.setView([poi.latitude, poi.longitude], 13, { animate: true })
    }, [poi, map])
    return null
}

function MovieMap({ poiUrl }: MovieMapProps) {
    const { currentTime } = useMovieContext()
    const [pois, setPois] = useState<Poi[]>([])
    const [lang, setLang] = useState<Lang>('fr')

    // Charge les points d'intérêt depuis le backend
    useEffect(() => {
        fetch(poiUrl)
            .then(r => {
                if (!r.ok) throw new Error('Indisponible')
                return r.json()
            })
            .then(setPois)
            .catch(() => {
                console.warn('POI indisponibles, utilisation du fallback local')
                fetch('/mocks/poi.json').then(r => r.json()).then(setPois)
            })
    }, [poiUrl])

    const active = getActivePoi(pois, currentTime)

    return (
        <section className="movie-map" aria-label="Carte des lieux de tournage">
            <div className="movie-map-header">
                <h3>Locate filming locations</h3>
            </div>

            <div className="movie-map-content">
                {pois.length > 0 && (
                    <>
                        {active && (
                            <div
                                className="scene-info"
                                role="status"
                                aria-live="polite"
                                aria-label={`Lieu actuel : ${getTitle(active.poi, lang)}`}
                            >
                                {/* Sélecteur de langue de l'encart */}
                                <div className="lang-selector" role="group" aria-label="Langue de la description">
                                    {(['fr', 'en', 'es'] as Lang[]).map(l => (
                                        <button
                                            key={l}
                                            className={`lang-btn ${lang === l ? 'active' : ''}`}
                                            onClick={() => setLang(l)}
                                            aria-label={LANG_LABELS[l]}
                                            aria-pressed={lang === l}
                                        >
                                            {/* aria-hidden : le label du bouton suffit */}
                                            <span aria-hidden="true">{LANG_FLAGS[l]}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="scene-title">
                                    <span className="scene-icon" aria-hidden="true">🎬</span>
                                    <strong>{getTitle(active.poi, lang)}</strong>
                                </div>
                                <div className="scene-text">
                                    <p>{getScene(active.ts, lang)}</p>
                                </div>
                            </div>
                        )}

                        {/* Carte Leaflet — non navigable au clavier par défaut (limitation Leaflet) */}
                        <MapContainer
                            center={[pois[0].latitude, pois[0].longitude]}
                            zoom={10}
                            style={{ height: '400px', width: '100%' }}
                            aria-label="Carte interactive des lieux de tournage"
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; OpenStreetMap contributors'
                            />
                            <MapController poi={active?.poi ?? null} />
                            {pois.map(poi => (
                                <Marker
                                    key={poi.id}
                                    position={[poi.latitude, poi.longitude]}
                                    opacity={active?.poi.id === poi.id ? 1 : 0.4}
                                    // title utilisé par Leaflet comme tooltip et texte alternatif
                                    title={getTitle(poi, lang)}
                                    alt={getTitle(poi, lang)}
                                >
                                    <Popup>
                                        <strong>{getTitle(poi, lang)}</strong>
                                        <p>{poi.description}</p>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </>
                )}
            </div>
        </section>
    )
}

export default MovieMap