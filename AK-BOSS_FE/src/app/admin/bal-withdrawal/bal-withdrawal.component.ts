import { Component, inject, OnInit } from '@angular/core';
import { AdminSidebarComponent } from '../../shared/admin/admin-sidebar/admin-sidebar.component';
import { CommonModule, NgFor } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { WithdrawalModalComponent } from '../withdrawal-modal/withdrawal-modal.component';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-bal-withdrawal',
  standalone: true,
  imports: [AdminSidebarComponent, NgFor, CommonModule],
  templateUrl: './bal-withdrawal.component.html',
  styleUrl: './bal-withdrawal.component.scss',
})
export class BalWithdrawalComponent implements OnInit {
  dialog = inject(MatDialog)
  apiservice = inject(ApiService)

  // users = [
  //   {
  //     id: 1,
  //     name: 'Ajay',
  //     requestdate: '2025-10-25',
  //     paymentdate: '2025-10-25',
  //     bank: 'HDFC BANK',
  //     method: 'UPI / BARCODE',
  //     amount: '5,000.00',
  //     utr: '8525822',
  //     status: 'pending',
  //     paymentype: 'Manual',
  //     action: 'Update'
  //   },
  //   {
  //     id: 2,
  //     name: 'Vijay',
  //     requestdate: '2025-10-25',
  //     paymentdate: '2025-10-25',
  //     bank: 'HDFC BANK',
  //     method: 'UPI / BARCODE',
  //     amount: '5,000.00',
  //     utr: '8525822',
  //     status: 'reject',
  //     paymentype: 'Manual',
  //     action: 'Update'
  //   },
  //   {
  //     id: 3,
  //     name: 'Ajay',
  //     requestdate: '2025-10-25',
  //     paymentdate: '2025-10-25',
  //     bank: 'HDFC BANK',
  //     method: 'UPI / BARCODE',
  //     amount: '5,000.00',
  //     utr: '8525822',
  //     status: 'pending',
  //     paymentype: 'Manual',
  //     action: 'Update'
  //   },
  //   {
  //     id: 4,
  //     name: 'Ajay',
  //     requestdate: '2025-10-25',
  //     paymentdate: '2025-10-25',
  //     bank: 'HDFC BANK',
  //     method: 'UPI / BARCODE',
  //     amount: '5,000.00',
  //     utr: '8525822',
  //     status: 'reject',
  //     paymentype: 'Manual',
  //     action: 'Update'
  //   },
  //   {
  //     id: 5,
  //     name: 'Ajay',
  //     requestdate: '2025-10-25',
  //     paymentdate: '2025-10-25',
  //     bank: 'HDFC BANK',
  //     method: 'UPI / BARCODE',
  //     amount: '5,000.00',
  //     utr: '8525822',
  //     status: 'success',
  //     paymentype: 'Manual',
  //     action: 'Update'
  //   },
  //   {
  //     id: 6,
  //     name: 'Ajay',
  //     requestdate: '2025-10-25',
  //     paymentdate: '2025-10-25',
  //     bank: 'HDFC BANK',
  //     method: 'UPI / BARCODE',
  //     amount: '5,000.00',
  //     utr: '8525822',
  //     status: 'success',
  //     paymentype: 'Manual',
  //     action: 'Update'
  //   },
  //   {
  //     id: 7,
  //     name: 'Ajay',
  //     requestdate: '2025-10-25',
  //     paymentdate: '2025-10-25',
  //     bank: 'HDFC BANK',
  //     method: 'UPI / BARCODE',
  //     amount: '5,000.00',
  //     utr: '8525822',
  //     status: 'pending',
  //     paymentype: 'Manual',
  //     action: 'Update'
  //   },
  //   {
  //     id: 8,
  //     name: 'Ajay',
  //     requestdate: '2025-10-25',
  //     paymentdate: '2025-10-25',
  //     bank: 'HDFC BANK',
  //     method: 'UPI / BARCODE',
  //     amount: '5,000.00',
  //     utr: '8525822',
  //     status: 'pending',
  //     paymentype: 'Manual',
  //     action: 'Update'
  //   },
  //   {
  //     id: 9,
  //     name: 'Ajay',
  //     requestdate: '2025-10-25',
  //     paymentdate: '2025-10-25',
  //     bank: 'HDFC BANK',
  //     method: 'UPI / BARCODE',
  //     amount: '5,000.00',
  //     utr: '8525822',
  //     status: 'pending',
  //     paymentype: 'Manual',
  //     action: 'Update'
  //   },
  //   {
  //     id: 10,
  //     name: 'Ajay',
  //     requestdate: '2025-10-25',
  //     paymentdate: '2025-10-25',
  //     bank: 'HDFC BANK',
  //     method: 'UPI / BARCODE',
  //     amount: '5,000.00',
  //     utr: '8525822',
  //     status: 'pending',
  //     paymentype: 'Manual',
  //     action: 'Update'
  //   },
  // ];
  isLoading: boolean | undefined;
  error: string | undefined;
  users: any;

viewUser(user: any) {
  const dialogRef = this.dialog.open(WithdrawalModalComponent, {
    width: '400px',
    panelClass: 'custom-dialog',
    data: user
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
   this.loadwithdrawlist()

    }
  });
}


  ngOnInit(): void {
   this.loadwithdrawlist()
  }


  loadwithdrawlist(){
   this.isLoading = true;
    this.apiservice.getallwithdrawllist().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load data';
        this.isLoading = false;
      }
    });
  }


}
