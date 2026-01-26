import './Discussion.css'
import {useDiscussionSocket} from "../../hooks/useDiscussionSocket.js";
import MessageList from "./MessageList/MessageList";
import MessageInput from "./MessageInput/MessageInput";

function Discussion() {

    const { messages, isConnected } = useDiscussionSocket('wss://tp-iai3.cleverapps.io/');

    const handleSend = (message: string) => {
        // TODO envoyer via WebSocket
        console.log('Envoyer:', message)
    }

    const handleMoment = () => {
        // TODO envoyer un moment via WebSocket
        console.log('Moment cliqué');
    }

    return (
        <div className="discussion">
            <div className="discussion-header">
                <h2>Discussion</h2>
                <span className={`status ${isConnected ? 'connected' : ''}`}>
          {isConnected ? '🟢' : '🔴'}
        </span>
            </div>
            <MessageList messages={messages}/>
            <MessageInput onSend={handleSend} onMoment={handleMoment}/>
        </div>
    );
}

export default Discussion
