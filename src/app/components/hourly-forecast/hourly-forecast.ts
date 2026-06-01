import { Component, input } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import type { HourlyForecast as HourlyForecastModel } from '../../models/weather.model';
import { WeatherIcon } from '../weather-icon/weather-icon';

@Component({
  selector: 'app-hourly-forecast',
  imports: [DecimalPipe, DatePipe, WeatherIcon],
  templateUrl: './hourly-forecast.html',
})
export class HourlyForecastList {
  readonly hours = input.required<HourlyForecastModel[]>();
}
