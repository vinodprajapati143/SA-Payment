import { Component, OnInit } from '@angular/core';
import { AdminSidebarComponent } from '../../shared/admin/admin-sidebar/admin-sidebar.component';
import { NgFor, NgIf } from '@angular/common';
import { EditgameModuleComponent } from '../editgame-module/editgame-module.component';
import { MatDialog } from '@angular/material/dialog';
import { BalanceModalComponent } from '../balance-modal/balance-modal.component';
import { ApiService } from '../../core/services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-bal-transfer',
  standalone: true,
  imports: [ AdminSidebarComponent, NgFor],
  templateUrl: './bal-transfer.component.html',
  styleUrl: './bal-transfer.component.scss'
})
export class BalTransferComponent implements OnInit {

  constructor(private dialog: MatDialog,private userService: ApiService,private toastr:ToastrService) {}
  usersWithBalance: any[] = [];
 isLoading = false;
  errorMsg = '';
  ngOnInit() {
    this.fetchUsersWithBalance();
  }
  fetchUsersWithBalance() {
    this.isLoading = true;
    this.errorMsg = '';
    this.userService.getUserswithbalnce().subscribe({
      next: (res: any) => {
        this.usersWithBalance = res.users || [];
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        if (err.status === 0) {
          this.errorMsg = 'Network error, please check your connection.';
          this.toastr.error(this.errorMsg)
        } else if (err.error?.message) {
          this.errorMsg = err.error.message;
          this.toastr.error(this.errorMsg)

        } else {
          this.errorMsg = 'Something went wrong. Please try again.';
          this.toastr.error(this.errorMsg)

        }
      }
    });
  }


viewUser(user: any) {
  this.dialog.open(BalanceModalComponent, {
    width: '400px',
    panelClass: 'custom-dialog',
    data: {
      name: user.username, // ya user.name
      phone: user.phone,
      balance: user.normal_balance,
      userId: user.user_id // id bhi bhejna zaroori
    }
  });
}
}
