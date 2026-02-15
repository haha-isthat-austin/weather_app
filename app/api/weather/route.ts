import { NextRequest, NextResponse } from "next/server";
import type { GeoResult, WeatherResponse } from "@/app/types/weather";

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
const FETCH_TIMEOUT_MS = 8000;

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function GET(request: NextRequest) {
  const location = request.nextUrl.searchParams.get("q");
  if (!location || location.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing or empty location query (q)" },
      { status: 400 }
    );
  }

  const trimmed = location.trim();
  const payload = {
    location: trimmed,
    weather: null as WeatherResponse | null,
    error: undefined as string | undefined,
  };

  try {
    const geoRes = await fetchWithTimeout(
      `${GEO_URL}?name=${encodeURIComponent(trimmed)}&count=1&language=en&format=json`
    );
    if (!geoRes.ok) {
      payload.error = "Search service unavailable. Try again in a moment.";
      return NextResponse.json(payload, { status: 502 });
    }
    const geoData = await geoRes.json();
    const results: GeoResult[] = geoData.results ?? [];
    if (results.length === 0) {
      payload.error = "Location not found. Try another city or spelling.";
      return NextResponse.json(payload);
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

    const weatherRes = await fetchWithTimeout(`${WEATHER_URL}?${params}`);
    if (!weatherRes.ok) {
      payload.error = "Weather service unavailable. Try again in a moment.";
      return NextResponse.json(payload, { status: 502 });
    }
    const weather: WeatherResponse = await weatherRes.json();

    return NextResponse.json({
      location: label,
      weather,
      error: undefined,
    });
  } catch (e) {
    const isTimeout =
      e instanceof Error && (e.name === "AbortError" || e.message?.includes("abort"));
    console.error(e);
    payload.error = isTimeout
      ? "Request took too long. Try again."
      : "Could not reach weather service. Check your connection and try again.";
    return NextResponse.json(payload, { status: 500 });
  }
}
