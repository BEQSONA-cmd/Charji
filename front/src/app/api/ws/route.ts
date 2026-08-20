import { experimental_upgradeWebSocket, type WebSocketData } from "@vercel/functions";
import Groq from "groq-sdk";

export const runtime = "nodejs";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_MESSAGE = `you are AI Chatbot`;

async function handleChat(ws: any, conversationHistory: ChatMessage[], prompt: string) {
  conversationHistory.push({ role: "user", content: prompt });

  try {
    const stream = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: conversationHistory,
      stream: true,
    });

    let fullResponse = "";

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content;
      if (token) {
        fullResponse += token;
        if (ws.readyState === 1) {
          ws.send(JSON.stringify({ type: "token", content: token }));
        }
      }
    }

    if (ws.readyState === 1) {
      ws.send(JSON.stringify({ type: "done" }));
    }

    conversationHistory.push({ role: "assistant", content: fullResponse });
  } catch (error) {
    console.error("Chat error:", error);
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({ type: "error", message: "Something went wrong." }));
    }
  }
}

export function GET() {
  return experimental_upgradeWebSocket((ws) => {
    const conversationHistory: ChatMessage[] = [
      { role: "system", content: SYSTEM_MESSAGE },
    ];

    ws.on("message", async (data: WebSocketData) => {
      try {
        const parsed = JSON.parse(String(data));
        if (parsed.type === "prompt" && parsed.content) {
          await handleChat(ws, conversationHistory, parsed.content);
        }
      } catch (error) {
        console.error("Invalid message:", error);
      }
    });

    ws.on("close", () => console.log("WebSocket disconnected"));
    ws.on("error", (error: Error) => console.error("WebSocket error:", error));
  });
}
