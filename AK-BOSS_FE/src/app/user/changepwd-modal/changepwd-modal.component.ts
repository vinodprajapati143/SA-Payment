import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../core/services/api.service';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-changepwd-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './changepwd-modal.component.html',
  styleUrl: './changepwd-modal.component.scss'
})
export class ChangepwdModalComponent implements OnInit {
  changePasswordForm!: FormGroup;
  showOldPassword = false;
  showNewPassword = false;
  isLoading = false;
  password: any;

  constructor(
    private dialogRef: MatDialogRef<ChangepwdModalComponent>,
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  closeModal() {
    this.dialogRef.close();
  }

  changePassword() {
    if (this.changePasswordForm.invalid) {
      this.toastr.warning('Please fill all fields correctly!');
      return;
    }

    const payload = this.changePasswordForm.value;
    this.isLoading = true;

    this.apiService.changePassword(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.success) {
          this.toastr.success(res.message || 'Password changed successfully!');
          this.dialogRef.close();
        } else {
          this.toastr.error(res.message || 'Password change failed!');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Change password error:', err);
        this.toastr.error(err.error?.message || 'Something went wrong!');
      },
    });
  }

  toggleVisibility(field: 'old' | 'new'): void {
    if (field === 'old') {
      this.showOldPassword = !this.showOldPassword;
    } else {
      this.showNewPassword = !this.showNewPassword;
    }
  }

}