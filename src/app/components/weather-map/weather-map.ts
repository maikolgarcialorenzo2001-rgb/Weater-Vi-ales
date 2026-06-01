import { Component, input, signal, type OnDestroy, afterNextRender } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import type { WeatherData, CurrentWeather } from '../../models/weather.model';
import { getWeatherDescription } from '../../models/weather.model';
import { WeatherIcon } from '../weather-icon/weather-icon';

const RAIN_GRID_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="22" height="22" style="filter:drop-shadow(0 1px 4px rgba(0,0,0,0.7));display:block"><path d="M0 0h80v80H0z" fill="none"/><g fill="#38bdf8"><path fill-rule="evenodd" d="M64.434 18.594a15.58 15.58 0 0 0-7.37-9.447l-.127-.072a16.1 16.1 0 0 0-12.02-1.542a16.1 16.1 0 0 0-9.781 7.383l-.786 1.335a11 11 0 0 0-2.092-.792a11.1 11.1 0 0 0-8.349 1.05a10.76 10.76 0 0 0-5.336 7.68a12.37 12.37 0 0 0-6.867 3.41l-.082.081a12.1 12.1 0 0 0 0 17.269l.082.08a12.37 12.37 0 0 0 8.667 3.544h5.667a10.3 10.3 0 0 1 2.744-4.632l4.543-4.405l2.605-3.35c2.276-2.926 6.951-1.673 7.46 1.999l.581 4.203l1.731 6.087q.015.048.027.098h11.05l.03-.002h2.816a12.37 12.37 0 0 0 8.667-3.543l.082-.08a12.1 12.1 0 0 0 0-17.269l-.082-.08a12.4 12.4 0 0 0-3.518-2.421c.356-2.177.249-4.42-.342-6.584m-24.94 29.979l-1.35-4.745a3 3 0 0 1-.086-.41l-.022-.163l-.102.13a3 3 0 0 1-.28.312l-4.693 4.551a4 4 0 0 0-.3.325z" clip-rule="evenodd"/><path d="M38.3 38.028c.647-.831 1.975-.475 2.12.568l.61 4.411l1.788 6.289a7.32 7.32 0 0 1-1.12 6.284a7.23 7.23 0 0 1-4.695 2.892a7.2 7.2 0 0 1-5.683-1.523a7.23 7.23 0 0 1-2.618-4.851a7.32 7.32 0 0 1 2.17-6.003l4.694-4.552zm13.647 17.346c.631-.781 1.89-.444 2.045.548l.246 1.57c.196 1.255.483 2.494.857 3.708l1.051 3.412a5.945 5.945 0 0 1-4.844 7.636l-.187.027a6.4 6.4 0 0 1-4.852-1.3l-.149-.117a5.945 5.945 0 0 1-.377-9.035l2.617-2.43a26.5 26.5 0 0 0 2.596-2.782zM22.722 57.78c.646-.831 1.975-.475 2.12.568l.36 2.61l1.342 4.716a5.49 5.49 0 0 1-.841 4.713a5.398 5.398 0 0 1-9.747-2.612a5.49 5.49 0 0 1 1.628-4.502l3.52-3.413z"/></g></svg>`;

const STORM_GRID_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" style="filter:drop-shadow(0 1px 4px rgba(0,0,0,0.7));display:block"><path d="M0 0h24v24H0z" fill="none"/><path fill="#38bdf8" d="M6 16a5 5 0 0 1-5-5a5 5 0 0 1 5-5c1-2.35 3.3-4 6-4c3.43 0 6.24 2.66 6.5 6.03L19 8a4 4 0 0 1 4 4a4 4 0 0 1-4 4h-1a1 1 0 0 1-1-1a1 1 0 0 1 1-1h1a2 2 0 0 0 2-2a2 2 0 0 0-2-2h-2V9a5 5 0 0 0-5-5C9.5 4 7.45 5.82 7.06 8.19C6.73 8.07 6.37 8 6 8a3 3 0 0 0-3 3a3 3 0 0 0 3 3h1a1 1 0 0 1 1 1a1 1 0 0 1-1 1zm6-5h3l-2 4h2l-3.75 7l.75-5H9.5z"/></svg>`;

interface MapLandmark {
  name: string;
  lat: number;
  lng: number;
}

interface LandmarkDetail {
  name: string;
  weather: CurrentWeather;
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-weather-map',
  imports: [DecimalPipe, WeatherIcon],
  templateUrl: './weather-map.html',
  styles: [`
    .leaflet-marker-icon { background: none !important; border: none !important; }
    .pin-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
      pointer-events: none;
    }
    .pin-hitarea {
      cursor: pointer;
      padding: 8px 12px 2px;
      pointer-events: auto;
    }
    .pin-name {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: #f1f5f9;
      background: rgba(15,23,42,0.75);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      border: 1px solid rgba(148,163,184,0.15);
      border-radius: 6px;
      padding: 1px 8px;
      white-space: nowrap;
      margin-top: 1px;
      opacity: 0;
      transition: opacity 0.25s ease, transform 0.25s ease;
      transform: translateY(-4px);
      pointer-events: auto;
      cursor: pointer;
    }
    .pin-name.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .light .pin-name {
      color: #0f172a;
      background: rgba(255,255,255,0.85);
      border-color: rgba(100,116,139,0.15);
    }
  `],
})
export class WeatherMap implements OnDestroy {
  readonly weather = input.required<WeatherData>();

  private map?: L.Map;
  private L?: typeof import('leaflet');
  private rainDots: L.Marker[] = [];
  private dotMarkers: L.Marker[] = [];
  private initialized = false;
  private pendingAbort?: AbortController;

  readonly activeLandmark = signal<string | null>(null);
  readonly panelVisible = signal(false);
  readonly selectedDetail = signal<LandmarkDetail | null>(null);
  readonly detailLoading = signal(false);
  readonly detailError = signal(false);

  private readonly center = { lat: 22.6184, lng: -83.7063 };

  private readonly landmarks: MapLandmark[] = [
    // Zona sur
    { name: 'El Moncada', lat: 22.5474, lng: -83.8409 },
    { name: 'La Majagua', lat: 22.5777, lng: -83.7084 },

    // Zona centro
    { name: 'Los Jazmines', lat: 22.5964, lng: -83.7237 },
    { name: 'Mural de la Prehistoria', lat: 22.6195, lng: -83.7429 },
    { name: 'El Cuajaní', lat: 22.6105, lng: -83.7326 },
    { name: 'Presa El Salto', lat: 22.6097, lng: -83.6561 },
    { name: 'La Hermita', lat: 22.6117, lng: -83.6988 },
    { name: 'Palenque de los Cimarrones', lat: 22.6534, lng: -83.7173 },

    // Zona norte
    { name: 'Rancho San Vicente', lat: 22.6740, lng: -83.7072 },
    { name: 'San Cayetano', lat: 22.7276, lng: -83.7496 },
    { name: 'El Rosario', lat: 22.7666, lng: -83.7016 },
    { name: 'Puerto Esperanza', lat: 22.7715, lng: -83.7315 },
    { name: 'República de Chile', lat: 22.6626, lng: -83.6761 },

    // Pueblo
    { name: 'Viñales', lat: 22.6184, lng: -83.7063 },
  ];

  constructor() {
    afterNextRender(() => {
      this.initMap();
      this.fetchRainGrid();
    });
  }

  private async initMap(): Promise<void> {
    const mod = await import('leaflet');
    const L = mod.default ?? mod;
    this.L = L;

    const bounds = L.latLngBounds(
      [22.52, -83.88], // esquina SO
      [22.80, -83.63], // esquina NE
    );

    this.map = L.map('weather-map', {
      center: [22.66, -83.75],
      zoom: 10,
      minZoom: 10,
      maxBounds: bounds,
      maxBoundsViscosity: 1,
      zoomControl: false,
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      keyboard: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    this.addLandmarks(L);

    this.map.on('moveend', () => this.updateActiveLandmark());
    this.updateActiveLandmark();

    this.initialized = true;
    setTimeout(() => this.map!.invalidateSize(), 200);
  }

  private addLandmarks(L: typeof import('leaflet')): void {
    for (const m of this.landmarks) {
      const pinIcon = L.divIcon({
        className: '',
        html: `<div class="pin-wrap">
          <div class="pin-hitarea">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" style="filter: drop-shadow(0 1px 3px rgba(0,0,0,0.5)); display: block;">
              <path fill="#0ea5e9" d="M12 11.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7"/>
            </svg>
          </div>
          <span class="pin-name" data-name="${m.name}">${m.name}</span>
        </div>`,
        iconSize: [0, 0],
        iconAnchor: [22, 44],
      });

      const pin = L.marker([m.lat, m.lng], { icon: pinIcon, interactive: true });

      // Click en el label también centra el landmark
      // Registrar ANTES de addTo() para que el evento 'add' se capture
      pin.on('add', () => {
        pin.getElement()
          ?.querySelector<HTMLElement>('.pin-name')
          ?.addEventListener('click', () => this.selectLandmark(m));
      });

      pin.addTo(this.map!).on('click', () => this.selectLandmark(m));

      this.dotMarkers.push(pin);
    }
  }

  // --- Selección manual de landmark ---
  private selectLandmark(m: MapLandmark): void {
    // Si ya está seleccionado, cerrar
    if (this.selectedDetail()?.name === m.name) {
      this.clearSelection();
      return;
    }

    this.detailLoading.set(true);
    this.detailError.set(false);
    this.selectedDetail.set(null);

    // Volar al lugar
    this.map?.flyTo([m.lat, m.lng], 14, { duration: 1.2 });

    // Abort previous fetch if any
    this.pendingAbort?.abort();
    const abort = new AbortController();
    this.pendingAbort = abort;

    const params = new URLSearchParams({
      latitude: m.lat.toString(),
      longitude: m.lng.toString(),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index,is_day,cloud_cover,precipitation',
      timezone: 'auto',
    });
    const url = `https://api.open-meteo.com/v1/forecast?${params}`;

    fetch(url, { signal: abort.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: OpenMeteoResponse) => {
        this.selectedDetail.set({
          name: m.name,
          lat: m.lat,
          lng: m.lng,
          weather: {
            temperature: data.current.temperature_2m,
            feelsLike: data.current.apparent_temperature,
            humidity: data.current.relative_humidity_2m,
            windSpeed: data.current.wind_speed_10m,
            windDirection: data.current.wind_direction_10m,
            uvIndex: data.current.uv_index,
            weatherCode: data.current.weather_code,
            description: getWeatherDescription(data.current.weather_code),
            isDay: data.current.is_day === 1,
            cloudCover: data.current.cloud_cover,
            pressure: 0,
            precipitation: data.current.precipitation,
            windGusts: 0,
          },
        });
        this.detailLoading.set(false);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        this.detailError.set(true);
        this.detailLoading.set(false);
      });
  }

  clearSelection(): void {
    this.selectedDetail.set(null);
    this.detailLoading.set(false);
    this.detailError.set(false);
  }

  // --- Etiquetas inteligentes ---
  private updateActiveLandmark(): void {
    if (!this.map || !this.initialized) return;

    const zoom = this.map.getZoom();
    const center = this.map.getCenter();

    if (zoom < 11) {
      // Muy lejos — solo pines visibles, sin etiquetas ni panel
      this.panelVisible.set(false);
      this.activeLandmark.set(null);
      for (const d of this.dotMarkers) {
        const svg = d.getElement()?.querySelector('svg');
        const label = d.getElement()?.querySelector('.pin-name');
        if (svg instanceof HTMLElement) {
          svg.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          svg.style.opacity = '1';
          svg.style.transform = 'scale(1)';
        }
        if (label instanceof HTMLElement) {
          label.classList.remove('visible');
        }
      }
      return;
    }

    if (zoom < 14) {
      // Distancia media — etiquetas visibles, sin panel
      this.panelVisible.set(false);
      this.activeLandmark.set(null);
      this.setLabelMode('inline');
      return;
    }

    // Zoom alto — panel con lugar activo, etiquetas ocultas
    let closest: MapLandmark | null = null;
    let minDist = Infinity;

    for (const m of this.landmarks) {
      const dist = center.distanceTo(this.L!.latLng(m.lat, m.lng));
      if (dist < minDist) {
        minDist = dist;
        closest = m;
      }
    }

    if (closest && minDist < 3000) {
      this.activeLandmark.set(closest.name);
      this.panelVisible.set(true);
      this.setLabelMode('panel');
    } else {
      this.panelVisible.set(false);
      this.activeLandmark.set(null);
      this.setLabelMode('panel');
    }
  }

  private setLabelMode(mode: 'inline' | 'panel'): void {
    for (const d of this.dotMarkers) {
      const svg = d.getElement()?.querySelector('svg');
      const label = d.getElement()?.querySelector('.pin-name');
      if (svg instanceof HTMLElement) {
        svg.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        svg.style.opacity = mode === 'panel' ? '0' : '1';
        svg.style.transform = mode === 'panel' ? 'scale(0.5)' : 'scale(1)';
      }
      if (label instanceof HTMLElement) {
        label.classList.toggle('visible', mode === 'inline');
      }
    }
  }

  // --- Grilla de precipitación ---
  private async fetchRainGrid(): Promise<void> {
    if (this.weather().current.precipitation < 0.3) return;

    const size = 7;
    const step = 0.02;
    const half = (size - 1) / 2;

    const lats: string[] = [];
    const lngs: string[] = [];

    for (let i = -half; i <= half; i++) {
      for (let j = -half; j <= half; j++) {
        lats.push((this.center.lat + i * step).toFixed(4));
        lngs.push((this.center.lng + j * step).toFixed(4));
      }
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats.join(',')}&longitude=${lngs.join(',')}&current=precipitation,weather_code`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data: unknown = await res.json();

      if (Array.isArray(data)) {
        const values: number[] = data.map(
          (d: { current?: { precipitation?: number | null } }) =>
            d.current?.precipitation ?? 0,
        );

        // Tomar el weather_code del primer punto con datos
        const code = data.reduce<number | null>((acc, d: { current?: { weather_code?: number | null } }) =>
          acc ?? d.current?.weather_code ?? null, null) ?? 0;

        if (this.initialized && this.map) {
          this.renderRain(values, size, step, code);
        }
      }
    } catch {
      // Silencio
    }
  }

  private renderRain(values: number[], size: number, step: number, weatherCode: number): void {
    // Solo mostramos iconos si es lluvia (51-86) o tormenta (95+)
    const isRain = weatherCode >= 51 && weatherCode <= 86;
    const isStorm = weatherCode >= 95;
    if (!isRain && !isStorm) return;

    const L = this.L!;
    const half = (size - 1) / 2;

    this.rainDots.forEach((d) => d.remove());
    this.rainDots = [];

    const iconHtml = isStorm ? STORM_GRID_SVG : RAIN_GRID_SVG;

    let idx = 0;
    for (let i = -half; i <= half; i++) {
      for (let j = -half; j <= half; j++) {
        const val = values[idx++] ?? 0;
        if (val < 0.3) continue;

        const lat = this.center.lat + i * step;
        const lng = this.center.lng + j * step;

        const icon = L.divIcon({
          className: '',
          html: iconHtml,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const marker = L.marker([lat, lng], {
          icon,
          interactive: false,
        }).addTo(this.map!);

        this.rainDots.push(marker);
      }
    }
  }

  ngOnDestroy(): void {
    this.pendingAbort?.abort();
    this.rainDots.forEach((d) => d.remove());
    this.map?.remove();
    this.map = undefined;
    this.initialized = false;
  }
}

// --- Tipo para respuesta de Open-Meteo ---
interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    uv_index: number;
    is_day: number;
    cloud_cover: number;
    precipitation: number;
  };
}
