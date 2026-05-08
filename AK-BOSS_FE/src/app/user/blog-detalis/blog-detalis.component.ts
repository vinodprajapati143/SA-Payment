import { Component, inject } from '@angular/core';
import { SettingService } from '../../core/services/setting.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BlogService } from '../../core/services/blog.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BlogHeaderComponent } from "../../shared/blog-header/blog-header.component";
import { BlogFooterComponent } from '../../shared/blog-footer/blog-footer.component';

@Component({
  selector: 'app-blog-detalis',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BlogHeaderComponent, BlogFooterComponent],
  templateUrl: './blog-detalis.component.html',
  styleUrl: './blog-detalis.component.scss'
})
export class BlogDetalisComponent {
  private settingStore = inject(SettingService);
  private route = inject(ActivatedRoute);
  private blogService=  inject(BlogService);
   private toastr= inject(ToastrService);
   private sanitizer = inject(DomSanitizer);
   private router = inject(Router);

  sitename: any;
  copyright: any;
  isEditMode: boolean | undefined;
  blogId: number | undefined;
  title: string | undefined;
  subDescription: string | undefined;
  selectedFile: null | undefined;
  imagePreview: any;
  blogContent: string | undefined;
  created_at: any;
  safeHtml!: SafeHtml;
  relatedblogs: any;

  ngOnInit(): void {
      const id = this.route.snapshot.paramMap.get('id');

  if (id) {
    this.isEditMode = true;
    this.blogId = +id;
    this.getBlogById(id);
    this.getBlogsExceptCurrentid({ page: 1, limit: 10 }, this.blogId);
  }
    this.settingStore.getSite().subscribe(res => {
      if (res) {
        this.sitename = res.name || 'AK-BOSS';
        this.copyright = res.copyright || '';
      }
    });
  }

  getBlogById(id: any) {
this.blogService.getBlogById(id).subscribe(res => {
  console.log('res: ', res);
  this.title = res.data.title;
  this.subDescription = res.data.subDescription;
  this.created_at = res.data.created_at;
  this.selectedFile = null;
  if (res.data.image) {
    this.imagePreview = res.data.image; // res.data.image is expected to be the image URL
  }
  this.blogContent = res.data.description; // CKEditor bind 🔥
  this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.blogContent);
  console.log('this.blogContent: ', this.blogContent);
});
}

navigateToBlog(blogId: number) {
  this.router.navigate(['/user/blog-detalis', blogId]);
  this.getBlogById(blogId);
}

getBlogsExceptCurrentid(params: any, currentId: number) {
  this.blogService.getBlogsExceptCurrentid(params, currentId).subscribe({
    next: (response: any) => {
      this.relatedblogs = response.data;
    },

    error: (error) => { 
      console.error('Error fetching blogs:', error);
      this.toastr.error(
        error?.error?.message || 'Failed to load blogs'
      );
    }
  });
}


}
