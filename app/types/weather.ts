export interface GeoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country_code: string;
  admin1?: string;
}

export interface CurrentWeather {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  is_day: number;
}

export interface DailyForecast {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
}

export interface WeatherResponse {
  latitude: number;
  longitude: number;
  current: CurrentWeather;
  daily: DailyForecast;
}

export interface WeatherPayload {
  location: string;
  weather: WeatherResponse | null;
  error?: string;
}
