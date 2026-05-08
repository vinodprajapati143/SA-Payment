import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from './core/services/api.service';
import { StorageService } from './core/services/storage.service';
import { LoaderComponent } from "./shared/loader/loader.component";
import { SettingService } from './core/services/setting.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'AK-BOSS';
  user: any;
 sessionStorageService = inject(StorageService);
 private settingStore = inject(SettingService);
  

   constructor(private router: Router, private strorageservice: StorageService, private toaster: ToastrService, private backendservice: ApiService,
    private titleService: Title
   ) {
  
    }

    setFavicon(iconUrl: string) {
  const link: HTMLLinkElement =
    document.querySelector("link[rel*='icon']") || document.createElement('link');

  link.type = 'image/x-icon';
  link.rel = 'shortcut icon';
  link.href = iconUrl;

  document.getElementsByTagName('head')[0].appendChild(link);
}

  ngOnInit(): void {
  const LoggedIN = this.sessionStorageService.getItem('authToken'); // Example: Retrieve from localStorage
      if(LoggedIN){
        this.getUserDetails();
      }

      this.settingStore.loadSettings();
      this.settingStore.getSite().subscribe(res => {
        if (res) {
          this.titleService.setTitle(res.name || 'My App Name');
        }
      });

      this.settingStore.getAppearance().subscribe(res => {
        if (res) {
          if (res.favicon) {
            this.setFavicon(res.favicon);
          } 
      }});
  }

  

    getUserDetails() {
    this.backendservice.getUserProfile().subscribe({
      next: (res:any) => {
        if (res.success) {
          this.user = res.data[0]; // 👈 yaha sari detail aayegi
          this.backendservice.userSubject.next(res.data);
        }
      },
      error: (err) => {
        console.error('Profile fetch error:', err);
      }
    });
  }

}
