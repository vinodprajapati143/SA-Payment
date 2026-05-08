import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, timer, EMPTY } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment.prod';
import { StorageService } from './storage.service'; // Adjust if different

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private baseUrl = environment.apiUrl;

  private walletBalanceSubject = new BehaviorSubject<number>(0);
  walletBalance$ = this.walletBalanceSubject.asObservable();

  private sessionStorageService = inject(StorageService);

  constructor(private http: HttpClient) {
    timer(0, 30000).pipe(
      switchMap(() => {
        // Check if token exists to determine logged-in
        const jwtToken = this.sessionStorageService.getItem('authToken');
        if (jwtToken) {
          return this.fetchWalletBalance();
        } else {
          // Stop polling if no token (logged out)
          return EMPTY;
        }
      })
    ).subscribe(balance => this.walletBalanceSubject.next(balance));
  }

  private fetchWalletBalance() {
    return this.http.get<{balance: number}>(`${this.baseUrl}/api/wallet/balance`).pipe(
      switchMap(response => [response.balance])
    );
  }

  refreshWallet() {
    const jwtToken = this.sessionStorageService.getItem('authToken');
    if (!jwtToken) return; // Do not refresh if logged out

    this.fetchWalletBalance().subscribe(balance => this.walletBalanceSubject.next(balance));
  }

  createAddMoneyOrder(amount: number) {
    return this.http.post<any>(
      `${this.baseUrl}/api/wallet/create-order`,
      { amount },
      { withCredentials: true }
    );
  }

  checkOrderStatus(clientTxnId: string) {
    return this.http.get<{
      message: any; success: boolean; status: string; data: any
    }>(
      `${this.baseUrl}/api/wallet/check-order-status?client_txn_id=${encodeURIComponent(clientTxnId)}`,
      { withCredentials: true }
    );
  }
}
