#include "includes.hpp"

std::string dotenv(const std::string &key)
{
    std::ifstream file(".env");

    std::string line;

    while (std::getline(file, line))
    {
        if (line.empty() || line[0] == '#')
            continue;

        size_t pos = line.find('=');

        if (pos == std::string::npos)
            continue;

        std::string name = line.substr(0, pos);

        std::string value = line.substr(pos + 1);

        if (name == key)
            return value;
    }

    return "";
}
