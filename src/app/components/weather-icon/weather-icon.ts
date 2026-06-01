import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

const ICONS: Record<string, string> = {
  clear: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
  <path d="M0 0h16v16H0z" fill="none"/>
  <path fill="currentColor" d="M8 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 8 1m0 10a3 3 0 1 0 0-6a3 3 0 0 0 0 6m6.5-2.5a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1zM8 13a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 8 13M2.5 8.5a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1zm.646-5.354a.5.5 0 0 1 .708 0l1 1a.5.5 0 1 1-.708.708l-1-1a.5.5 0 0 1 0-.708m.708 9.708a.5.5 0 1 1-.708-.707l1-1a.5.5 0 0 1 .708.707zm9-9.708a.5.5 0 0 0-.708 0l-1 1a.5.5 0 0 0 .708.708l1-1a.5.5 0 0 0 0-.708m-.708 9.708a.5.5 0 0 0 .708-.707l-1-1a.5.5 0 0 0-.708.707z"/>
</svg>`,

  'night-clear': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <path d="M0 0h32v32H0z" fill="none"/>
  <path fill="currentColor" d="M2.854 22.965c-.539-.938.21-1.965 1.15-1.965c6.627 0 12-5.373 12-12c0-1.43-.25-2.8-.708-4.07a2.12 2.12 0 0 1 .254-1.934a1.88 1.88 0 0 1 1.883-.785C24.006 3.363 29.001 9.097 29.001 16c0 7.732-6.268 14-14 14a14 14 0 0 1-12.147-7.035"/>
</svg>`,

  'mostly-clear': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <path d="M0 0h48v48H0z" fill="none" />
  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M20.43 17.33c4.46-.24 9.1 2.33 10.64 8.21a6.88 6.88 0 0 1 .05 13.71H11.89c-9.21-1.25-10.47-14.66 0-16.46a10.14 10.14 0 0 1 8.54-5.46m0 0" />
  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M25.55 18.37a6.22 6.22 0 1 1 8.58 8.21m-3-14.3V8.75m-6.25 6.12l-2.5-2.5m15 15.01l2.5 2.49m.09-8.75h3.53m-6.12-6.25l2.5-2.5" />
</svg>`,

  overcast: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
  <path d="M0 0h16v16H0z" fill="none" />
  <g fill="currentColor">
    <path d="M11.473 9a4.5 4.5 0 0 0-8.72-.99A3 3 0 0 0 3 14h8.5a2.5 2.5 0 1 0-.027-5" />
    <path d="M14.544 9.772a3.5 3.5 0 0 0-2.225-1.676a5.5 5.5 0 0 0-6.337-4.002a4.002 4.002 0 0 1 7.392.91a2.5 2.5 0 0 1 1.17 4.769z" />
  </g>
</svg>`,

  rain: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
  <path d="M0 0h80v80H0z" fill="none" />
  <g fill="currentColor">
    <path fill-rule="evenodd" d="M64.434 18.594a15.58 15.58 0 0 0-7.37-9.447l-.127-.072a16.1 16.1 0 0 0-12.02-1.542a16.1 16.1 0 0 0-9.781 7.383l-.786 1.335a11 11 0 0 0-2.092-.792a11.1 11.1 0 0 0-8.349 1.05a10.76 10.76 0 0 0-5.336 7.68a12.37 12.37 0 0 0-6.867 3.41l-.082.081a12.1 12.1 0 0 0 0 17.269l.082.08a12.37 12.37 0 0 0 8.667 3.544h5.667a10.3 10.3 0 0 1 2.744-4.632l4.543-4.405l2.605-3.35c2.276-2.926 6.951-1.673 7.46 1.999l.581 4.203l1.731 6.087q.015.048.027.098h11.05l.03-.002h2.816a12.37 12.37 0 0 0 8.667-3.543l.082-.08a12.1 12.1 0 0 0 0-17.269l-.082-.08a12.4 12.4 0 0 0-3.518-2.421c.356-2.177.249-4.42-.342-6.584m-24.94 29.979l-1.35-4.745a3 3 0 0 1-.086-.41l-.022-.163l-.102.13a3 3 0 0 1-.28.312l-4.693 4.551a4 4 0 0 0-.3.325z" clip-rule="evenodd" />
    <path d="M38.3 38.028c.647-.831 1.975-.475 2.12.568l.61 4.411l1.788 6.289a7.32 7.32 0 0 1-1.12 6.284a7.23 7.23 0 0 1-4.695 2.892a7.2 7.2 0 0 1-5.683-1.523a7.23 7.23 0 0 1-2.618-4.851a7.32 7.32 0 0 1 2.17-6.003l4.694-4.552zm13.647 17.346c.631-.781 1.89-.444 2.045.548l.246 1.57c.196 1.255.483 2.494.857 3.708l1.051 3.412a5.945 5.945 0 0 1-4.844 7.636l-.187.027a6.4 6.4 0 0 1-4.852-1.3l-.149-.117a5.945 5.945 0 0 1-.377-9.035l2.617-2.43a26.5 26.5 0 0 0 2.596-2.782zM22.722 57.78c.646-.831 1.975-.475 2.12.568l.36 2.61l1.342 4.716a5.49 5.49 0 0 1-.841 4.713a5.398 5.398 0 0 1-9.747-2.612a5.49 5.49 0 0 1 1.628-4.502l3.52-3.413z" />
  </g>
</svg>`,

  thunderstorm: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M0 0h24v24H0z" fill="none" />
  <path fill="currentColor" d="M6 16a5 5 0 0 1-5-5a5 5 0 0 1 5-5c1-2.35 3.3-4 6-4c3.43 0 6.24 2.66 6.5 6.03L19 8a4 4 0 0 1 4 4a4 4 0 0 1-4 4h-1a1 1 0 0 1-1-1a1 1 0 0 1 1-1h1a2 2 0 0 0 2-2a2 2 0 0 0-2-2h-2V9a5 5 0 0 0-5-5C9.5 4 7.45 5.82 7.06 8.19C6.73 8.07 6.37 8 6 8a3 3 0 0 0-3 3a3 3 0 0 0 3 3h1a1 1 0 0 1 1 1a1 1 0 0 1-1 1zm6-5h3l-2 4h2l-3.75 7l.75-5H9.5z" />
</svg>`,
};

function iconKey(code: number, _isDay: boolean): string {
  if (code === 0) return 'clear';
  if (code === 1) return 'clear';
  if (code === 2) return 'mostly-clear';
  if (code === 3) return 'overcast';
  if (code >= 45 && code <= 48) return 'overcast';
  if (code >= 51 && code <= 82) return 'rain';
  if (code >= 85 && code <= 86) return 'rain';
  if (code >= 95) return 'thunderstorm';
  return 'clear';
}

@Component({
  selector: 'app-weather-icon',
  template: `
    <span
      class="inline-flex items-center justify-center shrink-0 leading-none"
      [style.width]="size()"
      [style.height]="size()"
      [innerHTML]="svgIcon()"
    ></span>
  `,
})
export class WeatherIcon {
  readonly code = input.required<number>();
  readonly isDay = input(true);
  readonly size = input('1.5em');

  private readonly sanitizer = inject(DomSanitizer);

  readonly svgIcon = computed<SafeHtml>(() => {
    const key = iconKey(this.code(), this.isDay());
    return this.sanitizer.bypassSecurityTrustHtml(ICONS[key] ?? ICONS['clear']);
  });
}
