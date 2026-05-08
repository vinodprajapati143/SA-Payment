import { Component } from '@angular/core';
import { AdminSidebarComponent } from '../../shared/admin/admin-sidebar/admin-sidebar.component';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-all-report',
  standalone: true,
  imports: [AdminSidebarComponent, CommonModule, NgIf],
  templateUrl: './all-report.component.html',
  styleUrl: './all-report.component.scss'
})
export class AllReportComponent {
 transactions = [
       {
      openingBalance: 500,
      winAmount: 500,
      tax: 10000,
      status: 'SUCCEED',
      paymentmode: 'UPI',
      type: 'Add Money',
      route: '/add-amount',
      date: '2025-03-31 18:03:14',
      color: '#D76B00',
      purchaseAmount: 500,
      amountAfterTax: 2000,
      withdrawalAmount: 1500,
      closingBalance: 10000,
      winLoss: 500,
      active: false,
    },
  ];
}
