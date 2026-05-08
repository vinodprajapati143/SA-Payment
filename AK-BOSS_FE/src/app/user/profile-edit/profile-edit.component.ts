import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule, CommonModule],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss'
})
export class ProfileEditComponent implements OnInit {
  profileForm!: FormGroup;
  user: any;

  constructor(
    private fb: FormBuilder,
    private backendService: ApiService,
    private toastr: ToastrService,
    private router: Router,
    private dialogRef: MatDialogRef<ProfileEditComponent>
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      username: [''],
      phone: ['']
    });

    // user data patch
    this.backendService.user$.subscribe(user => {
      this.user = user;
      if (this.user) {
        this.profileForm.patchValue({
          username: this.user.username,
          phone: `${this.user.countryCode}-${this.user.phone}`
        });
      }
    });
  }

  closeModal() {
    this.dialogRef.close();
  }

  saveProfile() {
    if (this.profileForm.valid && this.user) {
      const [countryCode, phone] = this.profileForm.value.phone.split('-');
      const payload = {
        id: this.user.id,
        username: this.profileForm.value.username,
        phone,
        countryCode: countryCode || this.user.countryCode
      };

      // 🔹 Loader start
      this.backendService.setProfileLoading(true);

      this.backendService.updateUserProfile(payload).subscribe({
        next: (res: any) => {
          if (res.success) {
            const updatedUser = {
              ...this.user,
              username: this.profileForm.value.username,
              phone,
              countryCode: countryCode || this.user.countryCode
            };

            // Update subject + local storage instantly
            this.backendService.setUser(updatedUser);

            // 🔹 Loader stop
            this.backendService.setProfileLoading(false);

            this.toastr.success(res.message);
            this.dialogRef.close();
          } else {
            this.backendService.setProfileLoading(false);
            this.toastr.error(res.message || 'Update failed');
          }
        },
        error: (err) => {
          this.backendService.setProfileLoading(false);
          console.error('Update failed:', err);
          this.toastr.error('Something went wrong!');
        }
      });
    } else {
      this.toastr.warning('Please fill all fields correctly');
    }
  }

}
