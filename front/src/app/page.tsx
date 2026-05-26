"use client";

import { useEffect, useState } from "react";

const ws = new WebSocket("ws://localhost:8080/chat");

export default function Home() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<{ user?: string; bot?: string }[]>([]);
    const [currentBotMessage, setCurrentBotMessage] = useState("");

    useEffect(() => {
        ws.onmessage = (event) => {
            const text = String(event.data ?? "");
            setCurrentBotMessage((prev) => prev + text);
        };

        return () => ws.close();
    }, []);

    const handleSend = () => {
        const text = input.trim();
        if (!text) return;

        setMessages((prev) => [
            ...prev,
            ...(currentBotMessage ? [{ bot: currentBotMessage }] : []),
            { user: text },
        ]);

        setCurrentBotMessage("");

        if (ws.readyState === WebSocket.OPEN) {
            ws.send(text);
        }

        setInput("");
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
            <main className="flex flex-col justify-center items-center w-full max-w-md">
                <h1 className="text-4xl font-bold mb-2">ჩარჯი</h1>

                <div className="w-full bg-white rounded-lg shadow-lg p-4 h-96 overflow-y-auto mb-4 flex flex-col gap-2">
                    {messages.map((msg, idx) => (
                        <div key={idx}>
                            {msg.user && (
                                <div className="text-right text-blue-600">
                                    შენ: <span className="text-gray-800">{msg.user}</span>
                                </div>
                            )}
                            {msg.bot && (
                                <div className="text-left text-green-600">
                                    ჩარჯი: <span className="text-gray-800">{msg.bot}</span>
                                </div>
                            )}
                        </div>
                    ))}
                    {currentBotMessage && (
                        <div className="text-left text-green-600">
                            ჩარჯი: <span className="text-gray-800">{currentBotMessage}</span>
                        </div>
                    )}
                </div>
                <div className="flex gap-2 w-full">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="თქვენი კითხვა..."
                        className="flex-1 p-2 border rounded-lg"
                    />
                    <button
                        onClick={handleSend}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                    >
                        გაგზავნა
                    </button>
                </div>
            </main>
        </div>
    );
}