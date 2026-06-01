import { Injectable, signal, inject, isDevMode, type OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import type { WeatherData, CurrentWeather, HourlyForecast, DailyForecast } from '../models/weather.model';
import { getWeatherDescription } from '../models/weather.model';
import { CacheService } from './cache.service';
import { OfflineService } from './offline.service';

interface OpenMeteoResponse {
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    uv_index: number;
    is_day: number;
    cloud_cover?: number;
    pressure_msl?: number;
    precipitation?: number;
    wind_gusts_10m?: number;
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    weather_code: number[];
    is_day: number[];
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_probability_max: number[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class WeatherService implements OnDestroy {
  readonly weather = signal<WeatherData | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private readonly cache = inject(CacheService);
  private readonly offline = inject(OfflineService);
  private readonly destroy$ = new Subject<void>();

  constructor() {
    this.loadCachedWeather();
  }

  private async loadCachedWeather(): Promise<void> {
    const cached = await this.cache.getWeather();
    if (cached) {
      this.weather.set(cached);
      if (isDevMode()) {
        console.log('WeatherService: loaded from cache');
      }
    }
  }

  async fetchWeather(): Promise<void> {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set(null);

    try {
      const params = new URLSearchParams({
        latitude: '22.6184',
        longitude: '-83.7063',
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index,is_day,cloud_cover,pressure_msl,precipitation,wind_gusts_10m',
        hourly: 'temperature_2m,precipitation_probability,weather_code,is_day',
        daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max',
        timezone: 'auto',
        forecast_days: '7',
      });
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
      if (!response.ok) {
        throw new Error(`Open-Meteo returned ${response.status}`);
      }

      const raw: OpenMeteoResponse = await response.json();
      const data = this.parseResponse(raw);

      this.weather.set(data);
      this.cache.saveWeather(data);

      if (isDevMode()) {
        console.log('WeatherService: fetch successful');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al obtener el clima';
      this.error.set(message);

      // Fallback a cache si no tenemos datos en memoria
      if (!this.weather()) {
        const cached = await this.cache.getWeather();
        if (cached) {
          this.weather.set(cached);
          if (isDevMode()) {
            console.log('WeatherService: fallback to cached data');
          }
        }
      }

      if (isDevMode()) {
        console.warn('WeatherService: fetch failed', err);
      }
    } finally {
      this.loading.set(false);
    }
  }

  private parseResponse(raw: OpenMeteoResponse): WeatherData {
    // Fix: si la API reporta lluvia/llovizna pero la precipitación es casi nula,
    // probablemente es un falso positivo — mostramos "Despejado" o "Poco nuboso"
    let wmo = raw.current?.weather_code ?? 0;
    const precip = raw.current?.precipitation ?? 0;
    const cloud = raw.current?.cloud_cover ?? 0;

    // Códigos de precipitación: 51-67 (drizzle/rain/freezing), 80-82 (showers)
    const isRainCode = (wmo >= 51 && wmo <= 67) || (wmo >= 80 && wmo <= 82);
    if (isRainCode && precip < 0.5) {
      wmo = cloud < 40 ? 0 : 2; // 0 = despejado, 2 = intervalos nubosos
    }

    const current: CurrentWeather | null = raw.current
      ? {
          temperature: raw.current.temperature_2m,
          feelsLike: raw.current.apparent_temperature,
          humidity: raw.current.relative_humidity_2m,
          windSpeed: raw.current.wind_speed_10m,
          windDirection: raw.current.wind_direction_10m,
          uvIndex: raw.current.uv_index,
          weatherCode: wmo,
          description: getWeatherDescription(wmo),
          isDay: raw.current.is_day === 1,
          cloudCover: cloud,
          pressure: raw.current.pressure_msl ?? 0,
          precipitation: precip,
          windGusts: raw.current.wind_gusts_10m ?? 0,
        }
      : null;

    const hourly: HourlyForecast[] = [];
    if (raw.hourly) {
      for (let i = 0; i < raw.hourly.time.length; i++) {
        hourly.push({
          time: raw.hourly.time[i],
          temperature: raw.hourly.temperature_2m[i],
          precipitationProbability: raw.hourly.precipitation_probability[i],
          weatherCode: raw.hourly.weather_code[i],
          isDay: raw.hourly.is_day[i] === 1,
        });
      }
    }

    const daily: DailyForecast[] = [];
    if (raw.daily) {
      for (let i = 0; i < raw.daily.time.length; i++) {
        daily.push({
          date: raw.daily.time[i],
          temperatureMax: raw.daily.temperature_2m_max[i],
          temperatureMin: raw.daily.temperature_2m_min[i],
          weatherCode: raw.daily.weather_code[i],
          precipitationProbability: raw.daily.precipitation_probability_max[i],
        });
      }
    }

    return {
      current: current ?? {
        temperature: 0,
        feelsLike: 0,
        humidity: 0,
        windSpeed: 0,
        windDirection: 0,
        uvIndex: 0,
        weatherCode: 0,
        description: 'Sin datos',
        cloudCover: 0,
        pressure: 0,
        precipitation: 0,
        windGusts: 0,
        isDay: true,
      },
      hourly,
      daily,
      fetchedAt: Date.now(),
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
