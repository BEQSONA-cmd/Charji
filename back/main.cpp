#include "includes.hpp"

std::vector<WebSocket> chatClients;

void streamCallbackFunction(const std::string &chunk, WebSocket ws, std::string &fullResponse)
{
    std::stringstream localStream(chunk);
    std::string line;

    while (std::getline(localStream, line))
    {
        if (line.rfind("data: ", 0) == 0)
        {
            std::string jsonPart = line.substr(6);

            if (jsonPart == "[DONE]")
                return;

            try
            {
                auto json = json::parse(jsonPart);
                auto &delta = json["choices"][0]["delta"];

                if (delta.contains("content"))
                {
                    std::string content = delta["content"];
                    fullResponse += content;
                    ws->sendPayload(content);
                }
            }
            catch (...){}
        }
    }
}

void chat(WebSocket ws)
{
    chatClients.push_back(ws);
    
    std::vector<json> conversationHistory;
    
    conversationHistory.push_back({
        {"role", "system"},
        {"content", "შენ ხარ 'ჩარჯი' ..."}
    });
    
    while (ws->isConnected())
    {
        if (ws->onMessage())
        {
            std::string prompt = ws->getPayload();
            
            conversationHistory.push_back({
                {"role", "user"},
                {"content", prompt}
            });
            
            std::string fullResponse;
            
            std::string apiKey = dotenv("OPENAI_API_KEY");

            try {
                auto clientCopy = ws;  // This keeps the WS object alive
                
                auto res = fetch("https://api.groq.com/openai/v1/chat/completions", {
                    .method = "POST",
                    .headers = {
                        {"Authorization", "Bearer " + apiKey},
                        {"Content-Type", "application/json"}},
                    .body = json(
                        {
                            {"model", "llama-3.3-70b-versatile"},
                            {"messages", conversationHistory},
                            {"stream", true}
                        }
                    ).dump(),
                    .streamCallback = [clientCopy, &fullResponse](const std::string &chunk) { 
                        streamCallbackFunction(chunk, clientCopy, fullResponse);
                    }
                });
            }
            catch (const std::exception &e) {
                std::cerr << "Error: " << e.what() << std::endl;
            }
            
                    if (!fullResponse.empty()) {
                        conversationHistory.push_back({
                            {"role", "assistant"},
                            {"content", fullResponse}
                        });
                    }
        }
    }
    
    chatClients.erase(
        std::remove_if(chatClients.begin(), chatClients.end(), [&ws](const WebSocket &client) { 
            return client->getClientId() == ws->getClientId(); 
        }),
        chatClients.end()
    );
}

int main()
{
    Lumo server("0.0.0.0", 8080);
    server.allowOrigins({"https://localhost:3000"});
    server.useHttps("certs/cert.pem", "certs/key.pem");

    server.registerWebSocketRoute(chat, "/chat");

    server.start();
    return 0;
}
