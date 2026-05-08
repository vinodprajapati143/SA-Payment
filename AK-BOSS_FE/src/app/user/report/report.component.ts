import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import {
  NgFor,
  NgIf,
  NgStyle,
  CommonModule,
  DatePipe,
  TitleCasePipe,
} from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    NgIf,
    NgFor,
    NgStyle,
    DatePipe,
    TitleCasePipe,
    LoaderComponent,
    CommonModule,
    FormsModule
  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss',
})
export class ReportsComponent implements OnInit {
  router = inject(Router);
  reportservice = inject(ApiService);
  isLoading = false;
  error: string | null = null;
  startDate: string = '';
  endDate: string = '';
  filteredTransactions: any[] = [];
  mergedTransactions: any[] = [];
  searchText: string = '';
  playingrecords: any;
  winrecords: any;
  withdrawals: any;
  addMoneyList: any;

 ngOnInit() {
  this.isLoading = true;

  const today = new Date();

  // ✅ input me current date dikhane ke liye
  this.startDate = today.toISOString().split('T')[0];
  this.endDate = this.startDate;

  // baaki tera existing API calls same rahenge 👇
  let completed = 0;
  const totalRequests = 4;
  const checkDone = () => {
    completed++;
    if (completed === totalRequests) {
      this.isLoading = false;
    }
  };

  this.reportservice.getAllPlayingRecords().subscribe({
    next: (data) => {
      this.playingrecords = data;
      this.checkAndMerge();
      checkDone();
    },
    error: () => checkDone(),
  });

  this.reportservice.getAllWinRecords().subscribe({
    next: (data) => {
      this.winrecords = data;
      this.checkAndMerge();
      checkDone();
    },
    error: () => checkDone(),
  });

  this.reportservice.getWithdrawalsWithBalance().subscribe({
    next: (list) => {
      this.withdrawals = list;
      this.checkAndMerge();
      checkDone();
    },
    error: () => checkDone(),
  });

  this.reportservice.getAddMoneyList().subscribe({
    next: (data) => {
      this.addMoneyList = data;
      this.checkAndMerge();
      checkDone();
    },
    error: () => checkDone(),
  });
}


  applyFilters() {
  if (!this.startDate || !this.endDate) {
    this.filteredTransactions = this.mergedTransactions;
    return;
  }

  const from = new Date(this.startDate + 'T00:00:00');
  const to = new Date(this.endDate + 'T23:59:59');
  const search = this.searchText.toLowerCase();

  this.filteredTransactions = this.mergedTransactions.filter((txn: any) => {
    const txnDate = new Date(txn.txn_time);

    const dateMatch = txnDate >= from && txnDate <= to;
    const searchMatch =
      !search ||
      (txn.game_name && txn.game_name.toLowerCase().includes(search)) ||
      (txn.txn_type && txn.txn_type.toLowerCase().includes(search)) ||
      (txn.status && txn.status.toLowerCase().includes(search));

    return dateMatch && searchMatch;
  });

  console.log('🔍 Filtered by Date:', from, '→', to, this.filteredTransactions);
}

onSearchClick() {
  if (!this.startDate || !this.endDate) {
    // 🔸 Agar user ne date select nahi ki to default (yesterday + today) dikhao
    this.mergerArray();
    return;
  }

  const start = new Date(this.startDate + 'T00:00:00');
  const end = new Date(this.endDate + 'T23:59:59');

  this.filteredTransactions = this.mergedTransactions.filter((txn) => {
    if (!txn.txn_time) return false;
    const txnDate = new Date(txn.txn_time);
    return txnDate >= start && txnDate <= end;
  });

  console.log('🔍 Search Result:', start, '→', end, this.filteredTransactions);
}



mergerArray() {
  if (this.playingrecords && this.winrecords && this.withdrawals && this.addMoneyList) {
    const allTxns: any[] = [
      ...this.playingrecords.map((txn: any) => ({
        ...txn,
        txn_type: 'playing',
        txn_time: txn.created_at,
      })),
      ...this.winrecords.map((txn: any) => ({
        ...txn,
        txn_type: 'win',
        txn_time: txn.result_updated_at,
      })),
      ...this.withdrawals.map((txn: any) => ({
        ...txn,
        txn_type: 'withdrawal',
        txn_time: txn.requested_at,
      })),
      ...this.addMoneyList.map((txn: any) => ({
        ...txn,
        txn_type: 'addmoney',
        txn_time: txn.added_at,
      })),
    ];

    // Sort by date
    this.mergedTransactions = allTxns.sort(
      (a, b) => new Date(b.txn_time).getTime() - new Date(a.txn_time).getTime()
    );

    // ✅ Default filter (Yesterday + Today)
   const today = new Date();
    const start = new Date(`${today.toISOString().split('T')[0]}T00:00:00`);
    const end = new Date(`${today.toISOString().split('T')[0]}T23:59:59`);

    this.filteredTransactions = this.mergedTransactions.filter((txn) => {
      const txnDate = new Date(txn.txn_time);
      return txnDate >= start && txnDate <= end;
    });


    console.log('✅ Showing Yesterday + Today:', this.filteredTransactions);
  }
}




  checkAndMerge() {
    if (
      this.playingrecords &&
      this.winrecords &&
      this.withdrawals &&
      this.addMoneyList
    ) {
      this.mergerArray();
    }
  }
  resolveTxnLabel(type: string) {
    return type === 'win'
      ? 'Win'
      : type === 'addmoney'
        ? 'Add Money'
        : type === 'withdrawal'
          ? 'Withdrawal'
          : type === 'playing'
            ? 'Playing'
            : '';
  }

  getMatchingSelection(transaction: any) {
    console.log('transaction: ', transaction);
    // Only filter selections for WIN status
    if (transaction.status === 'WIN') {
      let matchValue = null;

      if (transaction.game_type === 'single_ank') {
        // Use close digit
        if (transaction.game_time_type === "open") {
          matchValue = transaction.result[1]?.toString();

        }
        else {
          matchValue = transaction.result[2]?.toString();

        }
      } else if (transaction.game_type === 'jodi_ank') {
        // Use jodi digits combination, e.g. "11"
        matchValue =
          transaction.result[1]?.toString() + transaction.result[2]?.toString();
      } else if (transaction.game_type === 'singlepanna_ank') {
        // Use panna number, e.g. "109"
        if (transaction.game_time_type === "open") {
          matchValue = transaction.result[0]?.toString();


        }
        else {
          matchValue = transaction.result[3]?.toString();

        }
      } else {
        // Other win cases: show all
        return transaction.selections;
      }

      // Filter only the winning selection(s)
      return transaction.selections.filter((sel: string) =>
        sel.startsWith(matchValue + ' X ')
      );
    }

    // For any NON-WIN (FAILED/SUCCEED/other): Show all selections
    return transaction.selections;
  }

  getSelectLabel(entryType: string, game_time_type: string): string {
    switch (entryType) {
      case 'single_ank':
        return `${game_time_type} Select`;
      case 'jodi_ank':
        return 'Jodi Select';
      case 'singlepanna_ank':
        return `${game_time_type} Select`;

      // Add more cases if needed
      default:
        return 'Select';
    }
  }
}
