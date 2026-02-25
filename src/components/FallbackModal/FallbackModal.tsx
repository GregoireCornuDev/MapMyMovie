import './FallbackModal.css'
import { Modal, Button } from 'react-bootstrap'

interface FallbackModalProps {
    show: boolean
    onUseMock: () => void
    onRetry: () => void
}

function FallbackModal({ show, onUseMock, onRetry }: FallbackModalProps) {
    return (
        // backdrop="static" et keyboard={false} : empêche la fermeture accidentelle
        // l'utilisateur doit faire un choix explicite
        <Modal
            show={show}
            centered
            backdrop="static"
            keyboard={false}
            className="fallback-modal"
            aria-labelledby="fallback-modal-title"
            // role="alertdialog" car la modale requiert une action immédiate
            role="alertdialog"
            aria-describedby="fallback-modal-body"
        >
            <Modal.Header>
                <Modal.Title id="fallback-modal-title">
                    {/* aria-hidden : l'icône est décorative, le titre suffit */}
                    <span className="warning-icon" aria-hidden="true">⚠️</span> Serveur indisponible
                </Modal.Title>
            </Modal.Header>

            <Modal.Body id="fallback-modal-body">
                <p>
                    Le serveur backend ne répond pas. Voulez-vous utiliser les données de démonstration (mock) ?
                </p>
            </Modal.Body>

            <Modal.Footer>
                {/* Réessaie de contacter le backend */}
                <Button variant="secondary" onClick={onRetry} aria-label="Non, réessayer de contacter le serveur">
                    Non, réessayer
                </Button>
                {/* Charge les données locales de fallback */}
                <Button variant="primary" onClick={onUseMock} aria-label="Oui, utiliser les données de démonstration">
                    Oui, utiliser le mock
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default FallbackModal