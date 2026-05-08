import { Component, inject } from '@angular/core';
import { BalanceModalComponent } from '../balance-modal/balance-modal.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AdminSidebarComponent } from '../../shared/admin/admin-sidebar/admin-sidebar.component';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-balance-return',
  standalone: true,
  imports: [ AdminSidebarComponent, NgFor],
  templateUrl: './balance-return.component.html',
  styleUrl: './balance-return.component.scss'
})
export class BalanceReturnComponent {

 
   constructor(private dialog: MatDialog) {}
     users = [
     { id: 2, name: 'laxman singh', mobile: '9460516066', memberType: 'Retailer', normalBalance: 575.10 },
     { id: 3, name: 'Ankit chourey', mobile: '9098250249', memberType: 'Guest', normalBalance: 0.00 },
     { id: 4, name: 'SUSHMA CHOUREY', mobile: '0000000000', memberType: 'Advertisement', normalBalance: 49.57 },
     { id: 5, name: 'MADHAV PRASAD CHOUREY', mobile: '9074149788', memberType: 'Branch', normalBalance: 34.87 },
     { id: 6, name: 'AJAY CHOUREY', mobile: '9575259525', memberType: 'Agent', normalBalance: 2009.01 },
     { id: 7, name: 'Sanjay chourey', mobile: '8120518485', memberType: 'Retailer', normalBalance: 225.78 },
     { id: 8, name: 'Ajay Chourey', mobile: '9770477020', memberType: 'Retailer', normalBalance: 186.19 },
     { id: 9, name: 'Rajendra Chourey', mobile: '9340870107', memberType: 'Retailer', normalBalance: 7.66 },
     { id: 10, name: 'DEEPENDRA CHOUREY', mobile: '9329559693', memberType: 'Retailer', normalBalance: 109.94 },
     { id: 11, name: 'dileep jaiswani', mobile: '7000108643', memberType: 'Retailer', normalBalance: 1.06 },
   ];
 
   viewUser() {
     // Logic to view user details
        this.dialog.open(BalanceModalComponent, {
               width: '100%',
               panelClass: 'custom-dialog'
             });
   }  
}
