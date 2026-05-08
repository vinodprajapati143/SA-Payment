import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AdminSidebarComponent } from '../../shared/admin/admin-sidebar/admin-sidebar.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-method',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent],
  templateUrl: './payment-method.component.html',
  styleUrl: './payment-method.component.scss'
})
export class PaymentMethodComponent {

routr = inject(Router)
  constructor() {

  }

  editMethod() {
    this.routr.navigateByUrl('admin/payment-update')
  }
}
