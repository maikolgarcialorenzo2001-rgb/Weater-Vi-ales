import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-last-updated',
  imports: [DatePipe],
  templateUrl: './last-updated.html',
})
export class LastUpdated {
  readonly lastFetched = input.required<number | null>();
}
