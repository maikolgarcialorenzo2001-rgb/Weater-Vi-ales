export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  fetchedAt: number;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
  weatherCode: number;
  description: string;
  isDay: boolean;
  cloudCover: number;
  pressure: number;
  precipitation: number;
  windGusts: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  precipitationProbability: number;
  weatherCode: number;
  isDay: boolean;
}

export interface DailyForecast {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  weatherCode: number;
  precipitationProbability: number;
}

export interface WeatherCache {
  data: WeatherData;
  cachedAt: number;
  expiresAt: number;
}

const WMO_CODES: Record<number, string> = {
  0: 'Cielo despejado',
   1: 'Poco nuboso',
   2: 'Intervalos nubosos',
   3: 'Muy nuboso',
  45: 'Niebla',
  48: 'Cencellada',
  51: 'Llovizna ligera',
  53: 'Llovizna moderada',
  55: 'Llovizna intensa',
  56: 'Lluvia helada ligera',
  57: 'Lluvia helada densa',
  61: 'Lluvia ligera',
  63: 'Lluvia moderada',
  65: 'Lluvia intensa',
  66: 'Lluvia helada ligera',
  67: 'Lluvia helada intensa',
  71: 'Nieve ligera',
  73: 'Nieve moderada',
  75: 'Nieve intensa',
  77: 'Granos de nieve',
  80: 'Chubascos ligeros',
  81: 'Chubascos moderados',
  82: 'Chubascos violentos',
  85: 'Chubascos de nieve ligeros',
  86: 'Chubascos de nieve intensos',
   95: 'Tormenta',
  96: 'Tormenta con granizo ligero',
  99: 'Tormenta con granizo intenso',
};

export function getWeatherDescription(code: number): string {
  return WMO_CODES[code] ?? 'Desconocido';
}
