import { Component, inject } from '@angular/core';
import { SettingService } from '../../core/services/setting.service';

@Component({
  selector: 'app-blog-footer',
  standalone: true,
  imports: [],
  templateUrl: './blog-footer.component.html',
  styleUrl: './blog-footer.component.scss'
})
export class BlogFooterComponent {
  settingStore = inject(SettingService);

  sitename: any;
  copyright: any;

  ngOnInit(): void {
    this.settingStore.getSite().subscribe(res => {
      if (res) {
        this.sitename = res.name || 'AK-BOSS';
        this.copyright = res.copyright || '';
      }
    });
  }
}