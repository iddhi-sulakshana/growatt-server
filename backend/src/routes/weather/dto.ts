import { z } from "zod";

export const weatherRequestSchema = z.object({
    latitude: z.coerce.number().min(-90).max(90).optional().default(8.326136771189327),
    longitude: z.coerce.number().min(-180).max(180).optional().default(80.40673005405628),
    timezone: z.string().optional().default("Asia/Bangkok"),
});

export type WeatherRequest = z.infer<typeof weatherRequestSchema>;

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

