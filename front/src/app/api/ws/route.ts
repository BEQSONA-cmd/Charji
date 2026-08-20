import {
  experimental_upgradeWebSocket,
  type WebSocketData,
} from "@vercel/functions";

export const runtime = "nodejs";

export function GET() {
  return experimental_upgradeWebSocket((ws) => {
    console.log("WEBSOCKET CONNECTED");

    ws.on("message", (data: WebSocketData) => {
      console.log("WEBSOCKET MESSAGE:", String(data));

      ws.send(
        JSON.stringify({
          type: "token",
          content: `Server received: ${String(data)}`,
        })
      );

      ws.send(
        JSON.stringify({
          type: "done",
        })
      );
    });

    ws.on("close", () => {
      console.log("WEBSOCKET CLOSED");
    });

    ws.on("error", (error) => {
      console.error("WEBSOCKET ERROR:", error);
    });
  });
}