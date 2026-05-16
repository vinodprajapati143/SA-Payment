import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SettingService } from '../../core/services/setting.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  private settingStore = inject(SettingService);
  sitename: any;
  copyright: any;

  ngOnInit(): void {
        this.settingStore.getSite().subscribe(res => {
      if (res) {
        this.sitename = res.name || 'AK-BOSS';
        this.copyright = res.copyright || '';
      } });
  }
}
