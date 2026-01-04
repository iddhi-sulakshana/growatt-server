import { ApiError, type DataResponse } from "@/types/api-contract";
import HTTP_STATUS from "@/types/status-codes";
import winston from "winston";
import type { WeatherRequest, WeatherResponse } from "./dto";
import axios from "axios";

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

export async function getWeatherDataService(
    payload: WeatherRequest
): Promise<DataResponse<WeatherResponse>> {
    try {
        const url = "https://api.open-meteo.com/v1/forecast";
        const params = {
            latitude: payload.latitude,
            longitude: payload.longitude,
            daily: ["weather_code", "sunrise", "sunset"],
            current: [
                "temperature_2m",
                "relative_humidity_2m",
                "weather_code",
                "cloud_cover",
                "wind_speed_10m",
                "wind_direction_10m",
                "precipitation",
                "rain",
            ],
            timezone: payload.timezone,
            forecast_days: 1,
        };

        const response = await axios.get(url, { params });

        if (!response.data || !response.data.current) {
            throw new ApiError(
                "Failed to retrieve weather data from Open-Meteo",
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
        }

        const current = response.data.current;
        const daily = response.data.daily;

        const weatherData: WeatherResponse = {
            current: {
                temperature: current.temperature_2m || 0,
                humidity: current.relative_humidity_2m || 0,
                weatherCode: current.weather_code || 0,
                cloudCover: current.cloud_cover || 0,
                windSpeed: current.wind_speed_10m || 0,
                windDirection: current.wind_direction_10m || 0,
                precipitation: current.precipitation || 0,
                rain: current.rain || 0,
            },
            daily: {
                sunrise: daily?.sunrise?.[0] || "",
                sunset: daily?.sunset?.[0] || "",
                weatherCode: daily?.weather_code?.[0] || 0,
            },
            location: {
                latitude: response.data.latitude || payload.latitude,
                longitude: response.data.longitude || payload.longitude,
                timezone: response.data.timezone || payload.timezone,
            },
        };

        return {
            message: "Weather data retrieved successfully",
            status: HTTP_STATUS.OK,
            data: weatherData,
        };
    } catch (error: any) {
        winston.error("Weather: Get weather data failed", error);
        throw new ApiError(
            error.message || "Failed to retrieve weather data",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
    }
}

export { getWeatherCondition };
