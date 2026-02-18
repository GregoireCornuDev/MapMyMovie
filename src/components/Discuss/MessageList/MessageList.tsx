import { DiscussionMessage } from '../../../types/Message';
import './MessageList.css';

interface MessageListProps {
    messages: DiscussionMessage[];
}

function MessageList({ messages }: MessageListProps) {
    return (
        <div className="message-list">
            {messages.map((msg, index) => (
                <div key={index} className="message">
                    <div className="message-header">
                        <span className="name">{msg.name}</span>
                        <span className="when">{msg.when}</span>
                    </div>
                    <p className="message-content">{msg.message}</p>
                    {msg.moment && <span className="moment">{msg.moment}</span>}
                </div>
            ))}
        </div>
    );
}

export default MessageList;