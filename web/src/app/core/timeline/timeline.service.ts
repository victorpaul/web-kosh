import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TimelineData, TimelineItem } from '../models/timeline-item.model';

@Injectable({ providedIn: 'root' })
export class TimelineService {
  constructor(private readonly http: HttpClient) {}

  getTimelineItems(): Observable<TimelineItem[]> {
    return this.http
      .get<TimelineData>('/data/timeline.json')
      .pipe(map((data) => data.timelineItems));
  }
}
