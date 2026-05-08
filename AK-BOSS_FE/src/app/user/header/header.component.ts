import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WalletService } from '../../core/services/wallet.service';
import { SettingService } from '../../core/services/setting.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  userWalletBalance: number | undefined;

  private settingStore = inject(SettingService);
  siteLogo: any;

  constructor(private router: Router,private walletService:WalletService) {}

  ngOnInit() {
  this.walletService.walletBalance$.subscribe(balance => {
    this.userWalletBalance = balance;
  });

  this.settingStore.getAppearance().subscribe(res => {
    if (res) {
      this.siteLogo = res.siteLogo || '';
    }})


}

  openWallet() {
     this.router.navigate(['/user/add-amount']);
  }

   openProfile() {
     this.router.navigate(['/user/profile']);
  }

  openDashboard() {
     this.router.navigate(['/user/dashboard']);
  }
}
