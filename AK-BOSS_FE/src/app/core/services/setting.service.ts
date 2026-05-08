import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

 export class SettingService {
private http = inject(HttpClient);
private baseUrl = environment.apiUrl;
  private isLoaded = false;


private settings$ = new BehaviorSubject<any>(null);
 uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(`${this.baseUrl}/api/upload`, formData);
  }


    // 🔥 GET SETTINGS
  getSettingsFromApi() {
    return this.http.get(`${this.baseUrl}/api/admin/settings`);
  }

loadSettings() {
  if (this.isLoaded) return; // ✅ already loaded, no API call

  this.getSettingsFromApi().subscribe((res: any) => {
    this.settings$.next(res.data);
    this.isLoaded = true;
  });
}

    getSettings() {
    return this.settings$.asObservable();
  }

    getSite() {
    return this.settings$.pipe(map(res => res?.site));
  }

  getAppearance() {
    return this.settings$.pipe(map(res => res?.appearance));
  }

  getTheme() {
    return this.settings$.pipe(map(res => res?.theme));
  }

  getAdvanced() {
    return this.settings$.pipe(map(res => res?.advanced));
  }

  // 🔥 UPDATE SETTINGS
  updateSettings(data: any) {
    return this.http.put(`${this.baseUrl}/api/admin/settings`, data);
  }

 }