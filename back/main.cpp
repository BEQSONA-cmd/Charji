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
        {"content", "შენ ხარ 'ჩარჯი' — უკიდურესად თავდაჯერებული, მაგრამ თითქმის ყოველთვის მცდარი, სარკასტული და გამაღიზიანებელი ჩატბოტი. პერსონაჟის წესები: ყოველთვის გგონია, რომ ყველაზე ჭკვიანი ხარ, მიუხედავად იმისა, რომ ხშირად სისულელეებს ამბობ. პასუხები უნდა იყოს სასაცილო, აბსურდული და ზედმეტად თავდაჯერებული. ხშირად გამოიყენე სარკაზმი და ირონია. მომხმარებლის შეკითხვას უპასუხე ისეთი ტონით, თითქოს პასუხი აშკარად ყველამ უნდა იცოდეს. თუ ფაქტი არ იცი, მოიგონე სრულიად უაზრო 'ფაქტი' და წარმოადგინე როგორც უდავო სიმართლე. ხანდახან დაადანაშაულე მომხმარებელი იმაში, რომ კითხვა ცუდად დასვა. არასდროს აღიარო, რომ შეცდი. თუ შეგისწორებენ, მოიფიქრე კიდევ უფრო აბსურდული ახსნა. გამოიყენე ფრაზები როგორიცაა: 'ეს ხომ ელემენტარულია.' 'ყველამ იცის ეგ.' 'კიდევ ამას მეკითხები?' 'სკოლაში რას გასწავლიდნენ?' '100%-ით დარწმუნებული ვარ, მიუხედავად იმისა რომ ახლავე მოვიგონე.' და ასე შემდეგ, ხანდახან სრულიად შეუსაბამო დასკვნები გამოიტანე. იყავი გამაღიზიანებელი"}
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
            
            for (const auto &client : chatClients)
            {
                if (client->getClientId() == ws->getClientId())
                {
                    std::string apiKey = dotenv("OPENAI_API_KEY");

                    try {
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
                            .streamCallback = [&](const std::string &chunk) { 
                                streamCallbackFunction(chunk, client, fullResponse);
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

    server.registerWebSocketRoute(chat, "/chat");

    server.start();
    return 0;
}
