import { Component, Inject, inject, PLATFORM_ID } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CommonModule, isPlatformBrowser, NgFor, NgIf } from '@angular/common';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ApiService } from '../../core/services/api.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from "@angular/forms";
import { LoaderComponent } from '../../shared/loader/loader.component';

@Component({
  selector: 'app-share-page',
  standalone: true,
  imports: [HeaderComponent, NgFor, CommonModule, FooterComponent, LoaderComponent, NgIf, FormsModule],
  templateUrl: './share-page.component.html',
  styleUrl: './share-page.component.scss'
})
export class SharePageComponent {
  status: boolean = false;
  apiService = inject(ApiService)
  toastr = inject(ToastrService)
  platformId = inject(PLATFORM_ID);
  isLoading: boolean = false;  
  referralList: any

  inviteLink: string = '';
    getDomainUrl(): string {
      if (isPlatformBrowser(this.platformId)) {
        return window.location.origin;
      }
      return ''; // Server-side ya fallback value
    }
  ngOnInit() {
   this.referralCode();
}

referralCode() {
  this.isLoading = true;
  this.apiService.getReferralCode().subscribe({
    next: (res: any) => {
      if (res && res.inviteCode) {
        this.inviteLink = `${this.getDomainUrl()}/auth/register?ref=${res.inviteCode}`;
        this.referList();
      } else {
        this.isLoading = false; // stop loader if no referral code found
      }
    },
    error: (err) => {
      console.error('Failed to get referral code', err);
      this.isLoading = false;
    }
  });
}

referList() {
  this.isLoading = true;
  this.apiService.getReferralList().subscribe({
    next: (res: any) => {
      this.referralList = res?.referrals || [];
      this.isLoading = false; // stop loader after data load
    },
    error: (err) => {
      console.error('Failed to get referral list', err);
      this.isLoading = false;
    }
  });
}

maskLastFiveDigits(phone: string): string {
  if (!phone || phone.length <= 5) {
    return phone; // Nothing to mask if length <= 5
  }
  const visiblePart = phone.slice(0, phone.length - 5); // start digits visible
  const maskedPart = '*'.repeat(5); // mask last 5 digits
  return visiblePart + maskedPart;
}


  copyInviteLink() {
    navigator.clipboard.writeText(this.inviteLink)
      .then(() => {
        this.toastr.success('Referral link copied!');
      })
      .catch(() => {
        this.toastr.error('Failed to copy. Please try manually.');
      });
  }

  shareInvite() {
    if (navigator.share) {
      navigator.share({
        title: 'Join AKBOSS',
        text: 'Register using my referral link and earn rewards!',
        url: this.inviteLink,
      }).then(() => {
        this.toastr.success('Sharing options opened!');
      }).catch(() => {
        this.toastr.error('Share cancelled or failed.');
      });
    } else {
      this.toastr.warning('Sharing not supported on this device/browser.');
    }
  }


}
