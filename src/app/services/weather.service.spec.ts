import { TestBed } from '@angular/core/testing';
import { WeatherService } from './weather.service';
import { CacheService } from './cache.service';
import { OfflineService } from './offline.service';

describe('WeatherService', () => {
  let service: WeatherService;
  let cacheService: CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeatherService);
    cacheService = TestBed.inject(CacheService);
  });

  it('should start with no weather data', () => {
    expect(service.weather()).toBeNull();
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('should set loading state during fetch', () => {
    service.fetchWeather();
    expect(service.loading()).toBe(true);
  });
});
