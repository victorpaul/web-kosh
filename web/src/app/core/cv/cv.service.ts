import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Cv } from '../models/cv.model';

@Injectable({ providedIn: 'root' })
export class CvService {
  private readonly http = inject(HttpClient);

  getCv(): Observable<Cv> {
    return this.http.get<Cv>('/data/cv.json');
  }
}
