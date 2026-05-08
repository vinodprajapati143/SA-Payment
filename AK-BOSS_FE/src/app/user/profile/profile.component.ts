import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../core/services/api.service';
import { StorageService } from '../../core/services/storage.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ChangepwdModalComponent } from '../changepwd-modal/changepwd-modal.component';
import { ProfileEditComponent } from '../profile-edit/profile-edit.component';
import { NgIf } from '@angular/common';
import { LoaderComponent } from '../../shared/loader/loader.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, NgIf, LoaderComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: any;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private strorageservice: StorageService,
    private toaster: ToastrService,
    private backendservice: ApiService
  ) {}
  logout() {
    this.backendservice.logout({}).subscribe({
      next: (res: any) => {
        this.toaster.success(res.message);
        this.strorageservice.removeItem('authToken');
        this.strorageservice.clear();
        this.strorageservice.clearCookies();

        this.router.navigate(['/user/home']);
      },
      error: (err) => {
        console.error('Logout failed:', err);
        this.strorageservice.removeItem('authToken');
        // this.router.navigate(['/home']);
      },
    });
  }

  ngOnInit(): void {
    this.getUserDetails();
    // 🔹 Listen to loader changes from ApiService
    this.backendservice.isProfileLoading$.subscribe((state) => {
      this.isLoading = state;
    });
    // 🔹 Listen to user changes
    this.backendservice.user$.subscribe((user) => {
      this.user = user;
    });
  }

  getUserDetails() {
    this.isLoading = true;
    this.backendservice.getUserProfile().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.user = res.data; // 👈 yaha sari detail aayegi
          this.backendservice.userSubject.next(res.data);
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Profile fetch error:', err);
        this.isLoading = false;
      },
    });
  }

  gameRate() {
    this.router.navigate(['/user/game-rate']);
  }

  chatSupport() {
    const phoneNumber = '919575259525';
    const message = 'Hello, I need assistance!';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, '_blank');
  }

  closeWhatsApp() {
    const url = `https://wa.me/919575259525?text=Goodbye`;
    window.open(url, '_blank');
  }

  howToPlay() {
    this.router.navigate(['/user/how-to-play']);
  }

  contactAdmin() {
    this.router.navigate(['/user/contact-admin']);
  }

  changePassword() {
    this.dialog.open(ChangepwdModalComponent, {
      width: '400px',
      panelClass: 'custom-dialog',
    });
  }

  editUserName() {
    this.dialog.open(ProfileEditComponent, {
      width: '400px',
      panelClass: 'custom-dialog',
    });
  }
}
