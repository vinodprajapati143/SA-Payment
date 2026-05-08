import { Component, inject, OnInit } from '@angular/core';
import { SettingService } from '../../core/services/setting.service';
import { BlogHeaderComponent } from "../../shared/blog-header/blog-header.component";
import { BlogFooterComponent } from '../../shared/blog-footer/blog-footer.component';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [BlogHeaderComponent, BlogFooterComponent],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent implements OnInit {
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
