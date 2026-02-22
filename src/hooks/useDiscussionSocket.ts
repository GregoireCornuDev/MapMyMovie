import { useState, useEffect } from 'react';
import { DiscussionMessage } from '../types/Message';

export function useDiscussionSocket(url: string) {
    const [messages, setMessages] = useState<DiscussionMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const ws = new WebSocket(url);

        ws.onopen = () => setIsConnected(true);
        ws.onclose = () => setIsConnected(false);

        ws.onmessage = (event) => {
            const data: DiscussionMessage = JSON.parse(event.data);
            setMessages((prev) => [...prev, data]);
        };

        return () => ws.close();
    }, [url]);

    return { messages, isConnected };
}
