import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SettingService } from '../../core/services/setting.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent  implements OnInit {
  private settingStore = inject(SettingService);
  siteLogo: any;
  constructor(private router: Router) { }

  ngOnInit() {
    
  this.settingStore.getAppearance().subscribe(res => {
    if (res) {
      this.siteLogo = res.siteLogo || '';
    }})
  }

  login() {
    this.router.navigate(['/auth/login']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}
