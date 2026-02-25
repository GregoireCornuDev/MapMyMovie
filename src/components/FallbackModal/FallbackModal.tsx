import './FallbackModal.css'

interface FallbackModalProps {
    show: boolean
    onUseMock: () => void
    onRetry: () => void
}

function FallbackModal({ show, onUseMock, onRetry }: FallbackModalProps) {
    if (!show) return null

    return (
        // Overlay sombre — backdrop="static" équivalent : pas de fermeture en cliquant en dehors
        // L'utilisateur doit faire un choix explicite
        <div className="fallback-overlay" aria-hidden="true">
            <div
                className="fallback-modal"
                // role="alertdialog" car la modale signale une situation anormale
                // et requiert une action immédiate — annoncé prioritairement par les lecteurs d'écran
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="fallback-title"
                aria-describedby="fallback-body"
            >
                <div className="fallback-header">
                    {/* aria-hidden : l'icône est décorative, le titre suffit */}
                    <span className="fallback-icon" aria-hidden="true">⚠️</span>
                    <h2 id="fallback-title">Serveur indisponible</h2>
                </div>

                <div className="fallback-body" id="fallback-body">
                    <p>Le serveur backend ne répond pas. Voulez-vous utiliser les données de démonstration ?</p>
                </div>

                <div className="fallback-footer">
                    {/* Réessaie de contacter le backend */}
                    <button
                        className="fallback-btn secondary"
                        onClick={onRetry}
                        aria-label="Non, réessayer de contacter le serveur"
                    >
                        Non, réessayer
                    </button>
                    {/* Charge les données locales de fallback */}
                    <button
                        className="fallback-btn primary"
                        onClick={onUseMock}
                        aria-label="Oui, utiliser les données de démonstration"
                    >
                        Oui, utiliser le mock
                    </button>
                </div>
            </div>
        </div>
    )
}

export default FallbackModal