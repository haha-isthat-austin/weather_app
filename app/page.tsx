"use client";

import { useState, FormEvent } from "react";
import { getWeatherLabel } from "./lib/weather-codes";
import type { WeatherPayload } from "./types/weather";

export default function Home() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<WeatherPayload | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setData(null);
    try {
      const res = await fetch(`/api/weather?q=${encodeURIComponent(q)}`);
      const json: WeatherPayload = await res.json();
      setData(json);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Network error.";
      setData({
        location: q,
        weather: null,
        error:
          message.toLowerCase().includes("fetch")
            ? "Could not reach the app. If you're running locally, start the dev server (npm run dev) and open http://localhost:3000."
            : `${message} Try again.`,
      });
    } finally {
      setLoading(false);
    }
  }

  const w = data?.weather;
  const current = w?.current;
  const daily = w?.daily;

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "clamp(1rem, 4vw, 2.5rem)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <h1
          style={{
            fontSize: "clamp(1.5rem, 4vw, 1.75rem)",
            fontWeight: 600,
            marginBottom: "0.5rem",
            color: "var(--text)",
          }}
        >
          Weather
        </h1>
        <p
          style={{
            color: "var(--muted)",
            fontSize: "0.9rem",
            marginBottom: "1.5rem",
          }}
        >
          Search by city or place name
        </p>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. San Francisco, Tokyo"
              disabled={loading}
              autoFocus
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text)",
                fontSize: "1rem",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "0.75rem 1.25rem",
                borderRadius: "var(--radius)",
                border: "none",
                background: "var(--accent)",
                color: "var(--bg)",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "…" : "Search"}
            </button>
          </div>
        </form>

        {data?.error && !data.weather && (
          <p style={{ color: "var(--warm)", marginBottom: "1rem" }}>
            {data.error}
          </p>
        )}

        {data && current && daily && (
          <section
            style={{
              background: "var(--surface)",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
              padding: "1.25rem",
              marginBottom: "1rem",
            }}
          >
            <p
              style={{
                color: "var(--muted)",
                fontSize: "0.85rem",
                marginBottom: "0.5rem",
              }}
            >
              {data.location}
            </p>
            <p
              style={{
                fontSize: "2.5rem",
                fontWeight: 700,
                color: "var(--text)",
                lineHeight: 1,
                marginBottom: "0.25rem",
              }}
            >
              {Math.round(current.temperature_2m)}°
            </p>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "0.95rem",
                marginBottom: "1rem",
              }}
            >
              {getWeatherLabel(current.weather_code)} · Feels like{" "}
              {Math.round(current.apparent_temperature)}°
            </p>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                fontSize: "0.85rem",
                color: "var(--muted)",
              }}
            >
              <span>Humidity {current.relative_humidity_2m}%</span>
              <span>
                Wind {Math.round(current.wind_speed_10m)} km/h
              </span>
            </div>
          </section>
        )}

        {daily && daily.time.length > 0 && (
          <section
            style={{
              background: "var(--surface)",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
              padding: "1rem",
            }}
          >
            <h2
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "var(--muted)",
                marginBottom: "0.75rem",
              }}
            >
              7-day forecast
            </h2>
            <ul style={{ listStyle: "none" }}>
              {daily.time.slice(0, 7).map((dateStr, i) => {
                const date = new Date(dateStr);
                const dayName =
                  i === 0
                    ? "Today"
                    : date.toLocaleDateString("en-US", { weekday: "short" });
                const max = daily.temperature_2m_max[i];
                const min = daily.temperature_2m_min[i];
                const code = daily.weather_code[i];
                return (
                  <li
                    key={dateStr}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.5rem 0",
                      borderBottom:
                        i < 6
                          ? "1px solid var(--border)"
                          : "none",
                      gap: "0.75rem",
                    }}
                  >
                    <span
                      style={{
                        width: "3rem",
                        fontSize: "0.9rem",
                        color: "var(--text)",
                      }}
                    >
                      {dayName}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        fontSize: "0.85rem",
                        color: "var(--muted)",
                      }}
                    >
                      {getWeatherLabel(code)}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.9rem",
                        color: "var(--cool)",
                      }}
                    >
                      {Math.round(min)}° / {Math.round(max)}°
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
