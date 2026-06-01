import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import type { CurrentWeather as CurrentWeatherModel } from '../../models/weather.model';
import { WeatherIcon } from '../weather-icon/weather-icon';

const DIRECTIONS = ['Norte', 'Noreste', 'Este', 'Sudeste', 'Sur', 'Sudoeste', 'Oeste', 'Noroeste'];

@Component({
  selector: 'app-current-weather',
  imports: [DecimalPipe, WeatherIcon],
  templateUrl: './current-weather.html',
})
export class CurrentWeatherCard {
  readonly weather = input.required<CurrentWeatherModel>();

  readonly windDirection = computed(() => {
    const index = Math.round(this.weather().windDirection / 45) % 8;
    return DIRECTIONS[index];
  });

  readonly uvLabel = computed(() => {
    const uv = this.weather().uvIndex;
    if (uv <= 2) return 'Bajo';
    if (uv <= 5) return 'Moderado';
    if (uv <= 7) return 'Alto';
    if (uv <= 10) return 'Muy alto';
    return 'Extremo';
  });

  readonly uvAdvice = computed(() => {
    const uv = this.weather().uvIndex;
    if (uv <= 2) return 'Sin peligro';
    if (uv <= 5) return 'Usa protección solar';
    if (uv <= 7) return 'Evita el sol del mediodía';
    if (uv <= 10) return 'Busca sombra, máxima protección';
    return 'No te expongas al sol';
  });

  readonly uvPercent = computed(() => Math.min(this.weather().uvIndex / 11 * 100, 100));

  readonly uvColor = computed(() => {
    const uv = this.weather().uvIndex;
    if (uv <= 2) return 'bg-green-400';
    if (uv <= 5) return 'bg-yellow-400';
    if (uv <= 7) return 'bg-orange-400';
    if (uv <= 10) return 'bg-red-400';
    return 'bg-purple-500';
  });
}
