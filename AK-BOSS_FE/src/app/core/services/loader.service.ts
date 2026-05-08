import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private requestCount = 0;
  private loaderSubject = new BehaviorSubject<boolean>(false);
  public loaderState$ = this.loaderSubject.asObservable();

  show() {
    this.requestCount++;
    if (this.requestCount === 1) {
      this.loaderSubject.next(true);
    }
  }

  hide() {
    if (this.requestCount > 0) {
      this.requestCount--;
    }
    if (this.requestCount === 0) {
      this.loaderSubject.next(false);
    }
  }
}
