import { Component, input } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import type { DailyForecast as DailyForecastModel } from '../../models/weather.model';
import { WeatherIcon } from '../weather-icon/weather-icon';

@Component({
  selector: 'app-daily-forecast',
  imports: [DecimalPipe, DatePipe, WeatherIcon],
  templateUrl: './daily-forecast.html',
})
export class DailyForecastList {
  readonly days = input.required<DailyForecastModel[]>();

  temperatureRange(min: number, max: number): number {
    const range = max - min;
    if (range <= 0) return 50;
    return Math.min(100, Math.max(10, (range / 20) * 100));
  }
}
