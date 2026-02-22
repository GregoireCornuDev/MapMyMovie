import './FallbackModal.css'
import { Modal, Button } from 'react-bootstrap'

interface FallbackModalProps {
    show: boolean
    onUseMock: () => void
    onRetry: () => void
}

function FallbackModal({ show, onUseMock, onRetry }: FallbackModalProps) {
    return (
        <Modal 
            show={show} 
            centered 
            backdrop="static"
            keyboard={false}
            className="fallback-modal"
        >
            <Modal.Header>
                <Modal.Title>
                    <span className="warning-icon">⚠️</span> Serveur indisponible
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Le serveur backend ne répond pas. Voulez-vous utiliser les données de démonstration (mock) ?
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onRetry}>
                    Non, réessayer
                </Button>
                <Button variant="primary" onClick={onUseMock}>
                    Oui, utiliser le mock
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default FallbackModal

