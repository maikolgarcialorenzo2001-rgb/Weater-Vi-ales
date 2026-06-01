import { Component, inject, type OnDestroy, afterNextRender } from '@angular/core';
import { fromEvent, Subject, takeUntil, debounceTime, filter, interval } from 'rxjs';
import { WeatherService } from '../../services/weather.service';
import { OfflineService } from '../../services/offline.service';
import { ThemeService } from '../../services/theme.service';
import { OfflineBanner } from '../../components/offline-banner/offline-banner';
import { LastUpdated } from '../../components/last-updated/last-updated';
import { CurrentWeatherCard } from '../../components/current-weather/current-weather';
import { HourlyForecastList } from '../../components/hourly-forecast/hourly-forecast';
import { DailyForecastList } from '../../components/daily-forecast/daily-forecast';
import { WeatherDashboard } from '../../components/weather-dashboard/weather-dashboard';
import { WeatherMap } from '../../components/weather-map/weather-map';

@Component({
  selector: 'app-home',
  imports: [
    OfflineBanner,
    LastUpdated,
    CurrentWeatherCard,
    HourlyForecastList,
    DailyForecastList,
    WeatherDashboard,
    WeatherMap,
  ],
  templateUrl: './home.html',
})
export class Home implements OnDestroy {
  private readonly weatherService = inject(WeatherService);
  readonly theme = inject(ThemeService);
  private readonly offline = inject(OfflineService);
  private readonly destroy$ = new Subject<void>();

  readonly weather = this.weatherService.weather;
  readonly loading = this.weatherService.loading;
  readonly error = this.weatherService.error;

  constructor() {
    afterNextRender(() => {
      this.weatherService.fetchWeather();

      fromEvent(document, 'visibilitychange')
        .pipe(
          takeUntil(this.destroy$),
          filter(() => document.visibilityState === 'visible'),
          debounceTime(30000),
        )
        .subscribe(() => {
          if (this.offline.isOnline()) {
            this.weatherService.fetchWeather();
          }
        });

      // Refresco automático cada 15 minutos
      interval(900_000)
        .pipe(
          takeUntil(this.destroy$),
          filter(() => this.offline.isOnline() && document.visibilityState === 'visible'),
        )
        .subscribe(() => this.weatherService.fetchWeather());
    });
  }

  retry(): void {
    this.weatherService.fetchWeather();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
