import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../../shared/admin/admin-sidebar/admin-sidebar.component';
import { ApiService } from '../../core/services/api.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
export interface User {
  name: string;
  enabled: boolean;
  date: string;
  phone: string;
  amountPaid: string;
  totalAmount: string;
  id: number | string;
}
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit  {
  protected readonly Math = Math;
  private apiService = inject(ApiService); 
  private toastr = inject(ToastrService);
  allUsers: any[] = [];
  users: any[] = [];
  paginatedUsers: any[] = [];
  loading = true;
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  searchTerm = '';
  selectedIds = new Set<string | number>();

  links = [{
    "img": "home",
    "text": "Home",
    "active": true
  },
  {
    "img": "report",
    "text": "Reports",
    "active": false
  },
  {
    "img": "referral",
    "text": "Referral",
    "active": false
  },
  {
    "img": "help",
    "text": "Help",
    "active": false
  },
  {
    "img": "logout",
    "text": "LogOut",
    "active": false
  }]
  cardsData = [
    {
      title: 'Total users',
      value: 12,
      percentage: '2.67%',
      direction: 'up',
      color: '#00D457',
      bgColor: '#00D45730',
      compareText: 'Than last week',
      icon: '/assets/admin-dashboard/icons/triangle.svg'
    },
    {
      title: 'Active users',
      value: 20,
      percentage: '2.67%',
      direction: 'up',
      color: '#FFA726',
      bgColor: '#FF9F4330',
      compareText: 'Than last week',
      icon: '/assets/admin-dashboard/icons/triangle.svg'
    },
    {
      title: 'On way order',
      value: 57,
      percentage: '0.67%',
      direction: 'down',
      color: '#64B5F6',
      bgColor: '#8ECAE630',
      compareText: 'Than last week',
      icon: '/assets/admin-dashboard/icons/triangle-down.svg'
    },
    {
      title: 'Disabled user',
      value: 98,
      percentage: '2.67%',
      direction: 'down',
      color: '#EF5350',
      bgColor: '#F1656530',
      compareText: 'Than last week',
      icon: '/assets/admin-dashboard/icons/triangle-down.svg'
    }
  ];

   ngOnInit(): void {
    this.loadUsers();
  }

  getImageUrl(img: string, active: boolean | undefined) {
    return `/assets/admin-dashboard/icons/${img}${active ? '-white' : ''}.svg`
  }


    loadUsers() {
    this.apiService.getUsers().subscribe({
      next: (res: any) => {
        this.allUsers = res.data;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching users', err);
        this.loading = false;
      }
    });
  }

  applyFilter() {
    if (!this.searchTerm) {
      this.users = [...this.allUsers];
    } else {
      const search = this.searchTerm.toLowerCase();
      this.users = this.allUsers.filter(u => 
        (u.username && u.username.toLowerCase().includes(search)) ||
        (u.phone && u.phone.includes(search)) ||
        (u.invitecode && u.invitecode.toLowerCase().includes(search))
      );
    }
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.users.length / this.itemsPerPage);
    this.updatePaginatedUsers();
  }

  updatePaginatedUsers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedUsers = this.users.slice(startIndex, endIndex);
  }

  onSearchChange() {
    this.applyFilter();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedUsers();
    }
  }

  getPages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  onItemsPerPageChange(event: any) {
    this.itemsPerPage = +event.target.value;
    this.applyFilter();
  }

  toggleSelection(id: string | number) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  toggleSelectAll(event: any) {
    const checked = event.target.checked;
    if (checked) {
      this.paginatedUsers.forEach(user => this.selectedIds.add(user.id));
    } else {
      this.paginatedUsers.forEach(user => this.selectedIds.delete(user.id));
    }
  }

  isAllSelected(): boolean {
    return this.paginatedUsers.length > 0 && this.paginatedUsers.every(user => this.selectedIds.has(user.id));
  }

  deleteSelectedUsers() {
    if (this.selectedIds.size === 0) {
      this.toastr.warning('Please select at least one user to delete');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${this.selectedIds.size} selected user(s)? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0A7E8D',
      cancelButtonColor: '#EF5350',
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      customClass: {
        confirmButton: 'rounded-sm px-6 py-2',
        cancelButton: 'rounded-sm px-6 py-2'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.executeDelete();
      }
    });
  }

  executeDelete() {
    this.loading = true;
    const deleteRequests = Array.from(this.selectedIds).map(id => this.apiService.deleteUser(id));

    forkJoin(deleteRequests).subscribe({
      next: (responses) => {
        this.toastr.success('Success', `Successfully deleted ${this.selectedIds.size} user(s)`);
        this.selectedIds.clear();
        this.loadUsers();
      },
      error: (err) => {
        console.error('Bulk Delete Error:', err);
        this.toastr.error('Error', 'Some users could not be deleted. Refreshing list...');
        this.selectedIds.clear();
        this.loadUsers();
      }
    });
  }

  exportToExcel() {
    if (this.users.length === 0) {
      this.toastr.warning('No data to export');
      return;
    }

    const headers = ['ID', 'Username', 'Status', 'Joining Date', 'Phone', 'Invite Code', 'Register Type'];
    const rows = this.users.map(user => [
      user.id,
      user.username,
      user.enabled ? 'Enabled' : 'Disabled',
      user.joiningdate ? new Date(user.joiningdate).toLocaleDateString() : 'N/A',
      user.phone,
      user.invitecode || 'N/A',
      user.registerType || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `AK_BOSS_Users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.toastr.success('Exported Successfully', 'User list has been downloaded');
  }
}
