import { Component, computed, input } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import type { WeatherData } from '../../models/weather.model';

@Component({
  selector: 'app-weather-dashboard',
  imports: [DecimalPipe, DatePipe],
  templateUrl: './weather-dashboard.html',
})
export class WeatherDashboard {
  readonly weather = input.required<WeatherData>();

  readonly temperature = computed(() => this.weather().current.temperature);
  readonly feelsLike = computed(() => this.weather().current.feelsLike);
  readonly humidity = computed(() => this.weather().current.humidity);
  readonly windSpeed = computed(() => this.weather().current.windSpeed);
  readonly windDirection = computed(() => this.weather().current.windDirection);
  readonly cloudCover = computed(() => this.weather().current.cloudCover);
  readonly pressure = computed(() => this.weather().current.pressure);
  readonly precipitation = computed(() => this.weather().current.precipitation);
  readonly windGusts = computed(() => this.weather().current.windGusts);
  readonly description = computed(() => this.weather().current.description);
  readonly fetchedAt = computed(() => this.weather().fetchedAt);

  readonly cloudState = computed(() => {
    const cc = this.cloudCover();
    if (cc <= 30) return 'despejado';
    if (cc <= 65) return 'parcial';
    return 'nublado';
  });

  readonly precipWidth = computed(() => Math.min(this.precipitation() * 10, 100));
}
