import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GamedataService {
  private storageKey = 'currentGameData';
  private gameDataSubject = new BehaviorSubject<any>(this.getFromStorage());

  constructor() { }

    private getFromStorage(): any {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  setGameData(game: any): void {
    localStorage.setItem(this.storageKey, JSON.stringify(game));
    this.gameDataSubject.next(game);
  }

  getGameData(): Observable<any> {
    return this.gameDataSubject.asObservable();
  }

  updateEntryType(entrytype: string) {
  const currentData = this.getFromStorage() || {};
  const updatedData = {...currentData, entrytype};
  this.setGameData(updatedData);
}

  clearGameData(): void {
    localStorage.removeItem(this.storageKey);
    this.gameDataSubject.next(null);
  }
}
