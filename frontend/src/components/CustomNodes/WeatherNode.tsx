import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning } from "lucide-react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "../ui/hover-card";
import { getWeatherService } from "@/service/weather";
import AnimatedNumber from "./AnimatedNumber";

// Weather code mapping from WMO Weather interpretation codes (WW)
const getWeatherCondition = (code: number): string => {
    // Clear sky
    if (code === 0) return "sunny";
    // Mainly clear, partly cloudy, and overcast
    if (code >= 1 && code <= 3) return "cloudy";
    // Fog and depositing rime fog
    if (code >= 45 && code <= 48) return "cloudy";
    // Drizzle
    if (code >= 51 && code <= 57) return "rainy";
    // Rain
    if (code >= 61 && code <= 67) return "rainy";
    // Snow
    if (code >= 71 && code <= 77) return "snowy";
    // Rain showers
    if (code >= 80 && code <= 82) return "rainy";
    // Snow showers
    if (code >= 85 && code <= 86) return "snowy";
    // Thunderstorm
    if (code >= 95 && code <= 99) return "stormy";
    // Default to sunny
    return "sunny";
};

const WeatherNode = () => {
    const { data: weatherData } = getWeatherService();

    const weather = weatherData?.data;
    const condition = weather
        ? getWeatherCondition(weather.current.weatherCode)
        : "sunny";
    const temperature = weather?.current.temperature ?? 0;
    const humidity = weather?.current.humidity ?? 0;
    const windSpeed = weather?.current.windSpeed ?? 0;
    const cloudCover = weather?.current.cloudCover ?? 0;
    const precipitation = weather?.current.precipitation ?? 0;

    const getWeatherIcon = () => {
        switch (condition) {
            case "sunny":
                return <Sun className="w-12 h-12 text-yellow-500" />;
            case "cloudy":
                return <Cloud className="w-12 h-12 text-gray-500" />;
            case "rainy":
                return <CloudRain className="w-12 h-12 text-blue-500" />;
            case "snowy":
                return <CloudSnow className="w-12 h-12 text-blue-300" />;
            case "stormy":
                return <CloudLightning className="w-12 h-12 text-purple-500" />;
            default:
                return <Sun className="w-12 h-12 text-yellow-500" />;
        }
    };

    return (
        <HoverCard>
            <HoverCardTrigger>
                <div className="flex flex-col items-center">
                    {/* Weather Icon */}
                    <div className="w-16 h-16 flex justify-center items-center">
                        {getWeatherIcon()}
                    </div>

                    {/* Temperature */}
                    <div className="text-sm font-semibold text-center whitespace-nowrap">
                        <p className="text-xs text-gray-600">
                            {condition.charAt(0).toUpperCase() +
                                condition.slice(1)}
                        </p>
                        <p className="text-lg font-sans font-bold text-blue-600">
                            {weather ? (
                                <AnimatedNumber
                                    value={temperature}
                                    decimals={1}
                                    suffix="°C"
                                />
                            ) : (
                                "--°C"
                            )}
                        </p>
                    </div>
                </div>
            </HoverCardTrigger>
            <HoverCardContent>
                <div className="p-2">
                    <h3 className="font-semibold text-lg mb-2">Weather Info</h3>
                    {weather ? (
                        <div className="space-y-1 text-sm">
                            <p>
                                <span className="font-semibold">
                                    Temperature:
                                </span>{" "}
                                <AnimatedNumber
                                    value={temperature}
                                    decimals={1}
                                    suffix="°C"
                                />
                            </p>
                            <p>
                                <span className="font-semibold">
                                    Condition:
                                </span>{" "}
                                {condition.charAt(0).toUpperCase() +
                                    condition.slice(1)}
                            </p>
                            <p>
                                <span className="font-semibold">Humidity:</span>{" "}
                                <AnimatedNumber
                                    value={humidity}
                                    decimals={0}
                                    suffix="%"
                                />
                            </p>
                            <p>
                                <span className="font-semibold">
                                    Wind Speed:
                                </span>{" "}
                                <AnimatedNumber
                                    value={windSpeed}
                                    decimals={1}
                                    suffix=" km/h"
                                />
                            </p>
                            <p>
                                <span className="font-semibold">
                                    Cloud Cover:
                                </span>{" "}
                                <AnimatedNumber
                                    value={cloudCover}
                                    decimals={0}
                                    suffix="%"
                                />
                            </p>
                            {precipitation > 0 && (
                                <p>
                                    <span className="font-semibold">
                                        Precipitation:
                                    </span>{" "}
                                    <AnimatedNumber
                                        value={precipitation}
                                        decimals={1}
                                        suffix=" mm"
                                    />
                                </p>
                            )}
                            {weather.daily.sunrise && (
                                <p>
                                    <span className="font-semibold">
                                        Sunrise:
                                    </span>{" "}
                                    {new Date(
                                        weather.daily.sunrise
                                    ).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            )}
                            {weather.daily.sunset && (
                                <p>
                                    <span className="font-semibold">
                                        Sunset:
                                    </span>{" "}
                                    {new Date(
                                        weather.daily.sunset
                                    ).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">
                            Loading weather data...
                        </p>
                    )}
                </div>
            </HoverCardContent>
        </HoverCard>
    );
};

export default WeatherNode;
