import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../core/services/api.service';
import { ToastrService } from 'ngx-toastr';
import { LoaderComponent } from "../../shared/loader/loader.component";

@Component({
  selector: 'app-withdrawal-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LoaderComponent],
  templateUrl: './withdrawal-modal.component.html',
  styleUrls: ['./withdrawal-modal.component.scss']
})
export class WithdrawalModalComponent {
  dialogRef = inject(MatDialogRef<WithdrawalModalComponent>);
  withdrawForm!: FormGroup
   isProcessing = false;
  message = '';
  constructor(
    private fb: FormBuilder,
    private apiservice:ApiService,
    private toastr:ToastrService,
    @Inject(MAT_DIALOG_DATA) public user: any
  ) {}

   ngOnInit() {
      const utcDate = this.user?.requested_at;
  const istDate = utcDate
    ? new Date(utcDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    : '';
    this.withdrawForm = this.fb.group({
      // User info
      user_id: [ this.user?.user_id ],

      name: [{ value: this.user?.user_name || '', disabled: true }],
      paymentDate: [{ value: istDate || '', disabled: true }],
      method: [{ value: this.toTitleCase(this.user?.payment_method || ''), disabled: true }],

      // UPI fields (conditionally shown)
      upi_phone_number: [{ value: this.user?.phone_number || '', disabled: true }],
      upi_account_holder_name: [{ value: this.user?.account_holder_name || '', disabled: true }],
      upi_id: [{ value: this.user?.upi_id || '', disabled: true }],

      // Bank fields (conditionally shown)
      bank_phone_number: [{ value: this.user?.phone_number || '', disabled: true }],
      bank_account_holder_name: [{ value: this.user?.account_holder_name || '', disabled: true }],
      bank_name: [{ value: this.user?.bank_name || '', disabled: true }],
      bank_account_number: [{ value: this.user?.account_number || '', disabled: true }],
      bank_ifsc_code: [{ value: this.user?.ifsc_code || '', disabled: true }],

      // Rest fields
      amount: [{ value: this.user?.amount || '', disabled: true }],
      remark: [''],
      password: [''],
      action: ['Success']
    });
  }




toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

  
onSubmit() {
  const missingFields: string[] = [];
  if (!this.withdrawForm.value.password) missingFields.push('Password');
  if (!this.withdrawForm.value.remark) missingFields.push('Remark');
  if (!this.withdrawForm.value.action) missingFields.push('Action');

  if (missingFields.length === 0) {
    // All fields exist, proceed
    this.isProcessing = true;
    const payload = {
      user_id: this.user.user_id,
      amount: this.user.amount,
      action: this.withdrawForm.value.action,
      remark: this.withdrawForm.value.remark,
      password: this.withdrawForm.value.password
    };
    this.apiservice.processWithdrawalRequest(payload).subscribe({
      next: (res) => {
        this.isProcessing = false;
        this.message = res.message || 'Success';
        this.toastr.success(this.message);
        setTimeout(() => this.dialogRef.close(true), 1000);
      },
      error: (err) => {
        console.log('err: ', err);
        this.isProcessing = false;
        this.message = err.data?.message || 'Failed to process request';
        this.toastr.error(this.message);
      }
    });
  } else {
    // Show which fields are missing, comma separated:
    this.message = `Please fill required fields: ${missingFields.join(', ')}`;
    this.toastr.error(this.message); // Or your preferred error display
  }
}


  closeModal() {
    this.dialogRef.close();
  }

}
