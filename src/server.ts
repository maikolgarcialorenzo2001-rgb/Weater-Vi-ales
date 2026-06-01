import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

const WEATHER_BASE = 'https://api.open-meteo.com/v1/forecast';
const WEATHER_PARAMS = new URLSearchParams({
  latitude: '22.6184',
  longitude: '-83.7063',
  current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index,is_day,cloud_cover,pressure_msl,precipitation,wind_gusts_10m',
  hourly: 'temperature_2m,precipitation_probability,weather_code,is_day',
  daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max',
  timezone: 'auto',
  forecast_days: '7',
});

app.get('/api/weather', async (_req, res) => {
  try {
    const response = await fetch(`${WEATHER_BASE}?${WEATHER_PARAMS}`);
    if (!response.ok) {
      res.status(response.status).json({ error: `Open-Meteo returned ${response.status}` });
      return;
    }
    const data = await response.json();
    res.set('Cache-Control', 'public, max-age=300');
    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Weather API unavailable';
    res.status(502).json({ error: message });
  }
});

app.get('/api/landmark-weather', async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) {
    res.status(400).json({ error: 'lat and lng query params required' });
    return;
  }
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index,is_day,cloud_cover,precipitation',
    timezone: 'auto',
  });
  try {
    const response = await fetch(`${WEATHER_BASE}?${params}`);
    if (!response.ok) {
      res.status(response.status).json({ error: `Open-Meteo returned ${response.status}` });
      return;
    }
    const data = await response.json();
    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Weather API unavailable';
    res.status(502).json({ error: message });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
