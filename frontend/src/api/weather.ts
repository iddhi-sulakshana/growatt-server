import ApiClient from "@/lib/ApiClient";
import type { DataResponse } from "@/types/api-contract";

export interface WeatherResponse {
    current: {
        temperature: number;
        humidity: number;
        weatherCode: number;
        cloudCover: number;
        windSpeed: number;
        windDirection: number;
        precipitation: number;
        rain: number;
    };
    daily: {
        sunrise: string;
        sunset: string;
        weatherCode: number;
    };
    location: {
        latitude: number;
        longitude: number;
        timezone: string;
    };
}

export const getWeatherApi = async (params?: {
    latitude?: number;
    longitude?: number;
    timezone?: string;
}) => {
    const response = await ApiClient.get<DataResponse<WeatherResponse>>(
        "/weather",
        {
            params,
        }
    );

    return response.data;
};

