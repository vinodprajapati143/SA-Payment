import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  active: string = 'dashboard';
  currentPath: string = '';
  constructor(private router: Router, private location: Location) {
  }
  // this.currentPath = this.location.path();

   isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  // Check if current route starts with /user
  isUserRoute(): boolean {
    return this.router.url.startsWith('/user');
  } 
  
 setActive(tab: string) {
    this.active = tab;
    this.router.navigate(['/user/' + tab]);
    localStorage.setItem('activeTab', tab);
  }

  // 👇 Yah naya aur sahi logic hai 👇
  getCurrentTab(): string {
    // Step 1: Current URL se query parameters hatayein (e.g., /user/profile/edit?id=1 -> /user/profile/edit)
    const currentPath = this.router.url.split('?')[0];

    // Step 2: Main tabs ke paths check karein. Agar URL us path se shuru hota hai, toh woh tab active hoga.
    if (currentPath.startsWith('/user/report')) {
      return 'report';
    } else if (currentPath.startsWith('/user/add-amount')) {
      return 'add-amount';
    } else if (currentPath.startsWith('/user/profile')) {
      return 'profile';
    } else if (currentPath.startsWith('/user/share')) {
      return 'share';
    } else if (currentPath.startsWith('/user/dashboard') || currentPath === '/user') {
      return 'dashboard';
    }
    
    // Agar koi match nahi mila, to default value ya dashboard
    return localStorage.getItem('activeTab') || 'dashboard';
  }
}
