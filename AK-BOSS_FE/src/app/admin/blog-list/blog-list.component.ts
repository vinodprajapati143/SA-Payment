import { Component, inject } from '@angular/core';
import { AdminSidebarComponent } from '../../shared/admin/admin-sidebar/admin-sidebar.component';
import { Router } from '@angular/router';
import { BlogService } from '../../core/services/blog.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [AdminSidebarComponent,CommonModule,FormsModule],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss'
})
export class BlogListComponent {
routr = inject(Router)
blogservice = inject(BlogService);
toastr = inject(ToastrService)

  constructor() {
  this.loadBlogs();
  }

  blogs: any[] = [];
pagination: any;
isLoading = false;

loadBlogs(page: number = 1) {
  this.isLoading = true;

  this.blogservice.getBlogs({ page, limit: 10 }).subscribe({
    next: (response: any) => {
      this.blogs = response.data;
      this.pagination = response.pagination;

      console.log('Blogs:', response);
      this.isLoading = false;
    },

    error: (error) => {
      console.error('Error fetching blogs:', error);

      this.toastr.error(
        error?.error?.message || 'Failed to load blogs'
      );

      this.isLoading = false;
    }
  });
}

toggleStatus(blog: any) {
  if (blog.loading) return;

  blog.loading = true;

  const oldStatus = blog.status;
  const newStatus = oldStatus === 1 ? 0 : 1;

  blog.status = newStatus;

  this.blogservice.updateBlogStatus(blog.id, newStatus)
    .subscribe({
      next: () => {
        this.toastr.success(
          `Blog ${newStatus === 1 ? 'Activated' : 'Deactivated'} successfully`
        );
        blog.loading = false;
      },
      error: (err) => {
        blog.status = oldStatus;
        blog.loading = false;

        this.toastr.error(
          err?.error?.message || 'Update failed'
        );
      }
    });
}

deleteBlog(blog: any, index: number) {

  // ✅ confirm before delete
  if (!confirm('Are you sure you want to delete this blog?')) {
    return;
  }

  blog.loading = true;

  this.blogservice.deleteBlog(blog.id)
    .subscribe({
      next: () => {
        this.toastr.success('Blog deleted successfully', 'Success');

        // ✅ remove from UI list
        this.blogs.splice(index, 1);
      },
      error: (err) => {
        blog.loading = false;

        const message =
          err?.error?.message ||
          'Delete failed';

        this.toastr.error(message, 'Error');

        console.error(err);
      }
    });
}

editBlog(id: number) {
  this.routr.navigate(['/admin/blog', id]); // 👈 dynamic route
}

  createNew() {
    this.routr.navigateByUrl('admin/blog')
  }
}
