import { useState } from 'react';
import './MessageInput.css';

interface MessageInputProps {
    onSend: (message: string) => void;
    onMoment: () => void;
}

function MessageInput({ onSend, onMoment }: MessageInputProps) {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (text.trim()) {
            onSend(text.trim());
            setText('');
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="message-input">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Votre message..."
            />
            <button onClick={handleSend}>Envoyer</button>
            <button onClick={onMoment}>Moment</button>
        </div>
    );
}

export default MessageInput;