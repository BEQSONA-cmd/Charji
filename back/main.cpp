#include "includes.hpp"

std::vector<WebSocket> chatClients;

void chat(WebSocket ws)
{
    chatClients.push_back(ws);
    while (ws->isConnected())
    {
        if (ws->onMessage())
        {
            std::string prompt = ws->getPayload();
            for (const auto &client : chatClients)
            {
                if (client->getClientId() == ws->getClientId())
                {
                    std::string apiKey = dotenv("OPENAI_API_KEY");

                    auto res = fetch("https://api.groq.com/openai/v1/chat/completions", {
                        .method = "POST",
                        .headers = {
                            {"Authorization", "Bearer " + apiKey},
                            {"Content-Type", "application/json"}},
                        .body = nlohmann::json(
                            {
                                {"model", "llama-3.3-70b-versatile"},
                                {"messages", {
                                    {
                                        {"role", "user"}, 
                                        {"content", prompt}
                                    }
                                }},
                                {"stream", true}
                            }
                        ).dump(),
                        .streamCallback = [ws](const std::string &chunk) {
                            std::stringstream localStream(chunk);

                            std::string line;

                            while (std::getline(localStream, line))
                            {
                                if (line.rfind("data: ", 0) == 0)
                                {
                                    std::string jsonPart = line.substr(6);

                                    if (jsonPart == "[DONE]")
                                    {
                                        return;
                                    }

                                    try
                                    {
                                        auto json = nlohmann::json::parse(jsonPart);

                                        auto &delta = json["choices"][0]["delta"];

                                        if (delta.contains("content"))
                                        {
                                            std::string content = delta["content"];
                                            ws->sendPayload(content);
                                        }
                                    }
                                    catch (...)
                                    {
                                    }
                                }
                            }
                    }
                });
                }
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
    server.allowOrigins({"http://localhost:3000"});

    // route for testing plain string response
    server.registerWebSocketRoute(chat, "/chat");

    server.start();
    return 0;
}
