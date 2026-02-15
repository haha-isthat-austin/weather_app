import { NextRequest, NextResponse } from "next/server";
import type { GeoResult, WeatherResponse } from "@/app/types/weather";

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

export async function GET(request: NextRequest) {
  const location = request.nextUrl.searchParams.get("q");
  if (!location || location.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing or empty location query (q)" },
      { status: 400 }
    );
  }

  try {
    const geoRes = await fetch(
      `${GEO_URL}?name=${encodeURIComponent(location.trim())}&count=1&language=en&format=json`
    );
    if (!geoRes.ok) throw new Error("Geocoding failed");
    const geoData = await geoRes.json();
    const results: GeoResult[] = geoData.results ?? [];
    if (results.length === 0) {
      return NextResponse.json({
        location: location.trim(),
        weather: null,
        error: "Location not found",
      });
    }

    const { latitude, longitude, name, country_code, admin1 } = results[0];
    const label = [name, admin1, country_code].filter(Boolean).join(", ");

    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current:
        "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,is_day",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,time",
      timezone: "auto",
      forecast_days: "7",
    });

    const weatherRes = await fetch(`${WEATHER_URL}?${params}`);
    if (!weatherRes.ok) throw new Error("Weather fetch failed");
    const weather: WeatherResponse = await weatherRes.json();

    return NextResponse.json({
      location: label,
      weather,
      error: undefined,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        location: location.trim(),
        weather: null,
        error: "Failed to fetch weather. Try again.",
      },
      { status: 500 }
    );
  }
}
