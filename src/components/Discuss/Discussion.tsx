import './Discussion.css'
import { useState } from 'react'
import {useDiscussionSocket} from "../../hooks/useDiscussionSocket.js";
import MessageList from "./MessageList/MessageList";
import Identity from "../Header/Identity/Identity";

interface DiscussionProps {
    userName?: string
    userAvatarUrl?: string
    onIdentityChange?: (name: string, avatarUrl: string) => void
    currentTime?: number
}

function Discussion({ userName: _userName, userAvatarUrl: _userAvatarUrl, onIdentityChange, currentTime = 0 }: DiscussionProps) {

    const { messages, isConnected } = useDiscussionSocket('wss://tp-iai3.cleverapps.io/');
    const [inputValue, setInputValue] = useState('')

    const handleSend = () => {
        if (inputValue.trim()) {
            console.log('Envoyer:', inputValue, 'au temps:', currentTime)
            setInputValue('')
        }
    }

    const handleMoment = () => {
        // TODO envoyer un moment via WebSocket
        console.log('Moment cliqué');
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="discussion">
            <Identity onIdentityChange={onIdentityChange} />

            <div className="discussion-header">
                <h2>Discussion</h2>
                <span className={`status ${isConnected ? 'connected' : ''}`}>
                    {isConnected ? 'En ligne' : 'Hors ligne'}
                </span>
            </div>

            <MessageList messages={messages}/>

            <div className="discussion-input-container">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="discussion-input"
                />
                <button className="moment-button" onClick={handleMoment} title="Add moment">
                    <img src="/icon/chrono.png" alt="Chrono" className="icon-chrono"/>
                </button>
                <button className="send-button" onClick={handleSend} title="Send">
                    <img src="/icon/send.png" alt="Send" className="icon-send"/>
                </button>
            </div>
        </div>
    );
}

export default Discussion
