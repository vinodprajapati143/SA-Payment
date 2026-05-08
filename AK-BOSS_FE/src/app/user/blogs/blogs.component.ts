import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { BlogService } from '../../core/services/blog.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BlogHeaderComponent } from "../../shared/blog-header/blog-header.component";
import { BlogFooterComponent } from "../../shared/blog-footer/blog-footer.component";

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [CommonModule, BlogHeaderComponent, BlogFooterComponent],
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.scss'
})
export class BlogsComponent  implements OnInit {
  tabs = ['All', 'Task', 'Collaboration', 'Productivity', 'Strategies'];
  activeTab = 'All';
  private blogsservice = inject(BlogService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  
  // blogs = [
  //   { title: 'Optimizing Workflow Processes', desc: 'Improve efficiency...' },
  //   { title: 'Managing Stakeholders', desc: 'Build trust...' },
  //   { title: 'Creative Thinking', desc: 'Boost innovation...' }
  // ];

  constructor() { }

  ngOnInit(): void {
  this.loadBlogs();
  }

blogs: any[] = [];
pagination: any;
isLoading = false;

loadBlogs(page: number = 1) {
  this.isLoading = true;

  this.blogsservice.getBlogswithStatus({ page, limit: 10 }).subscribe({
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

navigateToBlogDetails(blogId: number) {
  this.router.navigate(['/user/blog-detalis', blogId]);
}

   setTab(tab: string) {
    this.activeTab = tab;
  }
  
  getTeamClass(i: number): string {
    const row = Math.floor(i / 3);
    const col = i % 3;
    return (row + col) % 2 === 0 ? 'dark' : 'light';
  }

  featuredBlogs = [
    {
      category: 'Collaboration',
      title: 'Optimizing Workflow Processes for Maximum Efficiency',
      desc: 'Understand the importance of streamlining workflow processes to enhance collaboration, save time, and boost performance.',
      author: 'Joel Kenley',
      date: '8 Min Read',
      image: 'https://picsum.photos/seed/blog1/400/250'
    },
    {
      category: 'Productivity',
      title: 'Optimizing Workflow Processes for Maximum Efficiency',
      desc: 'Understand the importance of streamlining workflow processes to enhance collaboration, save time, and boost performance.',
      author: 'Joel Kenley',
      date: '8 Min Read',
      image: 'https://picsum.photos/seed/blog2/400/250'
    },
    {
      category: 'Strategies',
      title: 'Optimizing Workflow Processes for Maximum Efficiency',
      desc: 'Understand the importance of streamlining workflow processes to enhance collaboration, save time, and boost performance.',
      author: 'Joel Kenley',
      date: '8 Min Read',
      image: 'https://picsum.photos/seed/blog3/400/250'
    }
  ];

  topBlogs = [
    {
      category: 'Collaboration',
      title: 'Managing Stakeholder Expectations for Project Success',
      date: '8 Min Read',
      image: 'https://picsum.photos/seed/top1/200/120'
    },
    {
      category: 'Collaboration',
      title: 'Managing Stakeholder Expectations for Project Success',
      date: '12 Min Read',
      image: 'https://picsum.photos/seed/top2/200/120'
    }
  ];

  mainTopBlog = {
    category: 'Collaboration',
    title: 'Creating Effective Project Roadmaps for Success',
    desc: 'Learn how to develop comprehensive project roadmaps that provide clear direction, outline key milestones, and enhance team alignment.',
    author: 'Joel Kenley',
    date: '8 Min Read',
    image: 'https://picsum.photos/seed/main/600/400'
  };

  latestInsights = [
    {
      category: 'Collaboration',
      title: 'Optimizing Workflow Processes for Maximum Efficiency',
      desc: 'Understand the importance of streamlining workflow processes to enhance collaboration, save time, and boost performance.',
      author: 'Joel Kenley',
      date: '8 Min Read',
      image: 'https://picsum.photos/seed/insight1/400/250'
    },
    {
      category: 'Productivity',
      title: 'Optimizing Workflow Processes for Maximum Efficiency',
      desc: 'Understand the importance of streamlining workflow processes to enhance collaboration, save time, and boost performance.',
      author: 'Joel Kenley',
      date: '8 Min Read',
      image: 'https://picsum.photos/seed/insight2/400/250'
    },
    {
      category: 'Strategies',
      title: 'Optimizing Workflow Processes for Maximum Efficiency',
      desc: 'Understand the importance of streamlining workflow processes to enhance collaboration, save time, and boost performance.',
      author: 'Joel Kenley',
      date: '8 Min Read',
      image: 'https://picsum.photos/seed/insight3/400/250'
    },
    {
      category: 'Collaboration',
      title: 'Optimizing Workflow Processes for Maximum Efficiency',
      desc: 'Understand the importance of streamlining workflow processes to enhance collaboration, save time, and boost performance.',
      author: 'Joel Kenley',
      date: '8 Min Read',
      image: 'https://picsum.photos/seed/insight4/400/250'
    },
    {
      category: 'Productivity',
      title: 'Optimizing Workflow Processes for Maximum Efficiency',
      date: '8 Min Read',
      image: 'https://picsum.photos/seed/insight5/400/250'
    },
    {
      category: 'Strategies',
      title: 'Optimizing Workflow Processes for Maximum Efficiency',
      date: '8 Min Read',
      image: 'https://picsum.photos/seed/insight6/400/250'
    }
  ];

  teamMembers = [
    { name: 'Joel Kenley', role: 'Web Designer', desc: 'Innovative manager driving product development with a focus on user-centric project solutions.', image: 'https://i.pravatar.cc/150?u=joel' },
    { name: 'Joel Kenley', role: 'Web Designer', desc: 'Innovative manager driving product development with a focus on user-centric project solutions.', image: 'https://i.pravatar.cc/150?u=kenley' },
    { name: 'Joel Kenley', role: 'Web Designer', desc: 'Innovative manager driving product development with a focus on user-centric project solutions.', image: 'https://i.pravatar.cc/150?u=joel2' },
    { name: 'Joel Kenley', role: 'Web Designer', desc: 'Innovative manager driving product development with a focus on user-centric project solutions.', image: 'https://i.pravatar.cc/150?u=kenley2' },
    { name: 'Joel Kenley', role: 'Web Designer', desc: 'Innovative manager driving product development with a focus on user-centric project solutions.', image: 'https://i.pravatar.cc/150?u=joel3' },
    { name: 'Joel Kenley', role: 'Web Designer', desc: 'Innovative manager driving product development with a focus on user-centric project solutions.', image: 'https://i.pravatar.cc/150?u=kenley3' }
  ];




 }
