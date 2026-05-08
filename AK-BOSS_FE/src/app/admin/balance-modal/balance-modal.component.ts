import { NgIf } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../core/services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-balance-modal',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgIf],
  templateUrl: './balance-modal.component.html',
  styleUrl: './balance-modal.component.scss'
})
export class BalanceModalComponent {
   transferForm!: FormGroup;
  errorMsg = '';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BalanceModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private walletService: ApiService,
    private toastr:ToastrService
  ) {}

  ngOnInit(): void {
    this.transferForm = this.fb.group({
      name: [{ value: this.data.name, disabled: true }],
      phone: [{ value: this.data.phone, disabled: true }],
      balance: [{ value: this.data.balance, disabled: true }],
      amount: ['', [Validators.required, Validators.min(1)]],
      confirmAmount: ['', [Validators.required]],
      remark: [''],
      password: ['', [Validators.required, Validators.minLength(4)]]
    }, { validators: this.amountsMatch });
  }

  amountsMatch(group: FormGroup) {
    return group.get('amount')?.value === group.get('confirmAmount')?.value ? null : { notMatched: true };
  }

   closeModal() {
  this.dialogRef.close();
}

  submitForm() {
    if (this.transferForm.invalid) return;
    this.isSubmitting = true;
    this.errorMsg = '';
    const payload = {
      userId: this.data.userId,
      amount: this.transferForm.get('amount')?.value,
      remark: this.transferForm.get('remark')?.value,
      password: this.transferForm.get('password')?.value
    };
    this.walletService.transferToUser(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        // this.toastr.error(this.errorMsg)

        this.dialogRef.close('success');
        window.location.reload()
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.errorMsg = err.data.message || 'Transaction failed, try again.';
        this.toastr.error(this.errorMsg)
      }
    });
  }
}
