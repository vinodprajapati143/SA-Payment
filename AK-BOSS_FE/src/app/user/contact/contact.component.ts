import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ApiService } from '../../core/services/api.service';
import { SettingService } from '../../core/services/setting.service';
import { BlogFooterComponent } from '../../shared/blog-footer/blog-footer.component';
import { BlogHeaderComponent } from '../../shared/blog-header/blog-header.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BlogHeaderComponent, BlogFooterComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  private settingStore = inject(SettingService);

  isSubmitting = false;
  location: any;
  phone: any;
  email: any;
  apiLink: any;
  name: any;
  copyright: any;
  
  constructor(private fb: FormBuilder, private apiService: ApiService) {
    // Create the reactive form with requested fields
    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      emailId: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9+() -]+$')]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.getContactInfo();
  }

  getContactInfo() {
      // this.settingStore.loadSettings();

  this.settingStore.getSite().subscribe(res => {
    if (res) {
       this.location = res.address || '';
       this.phone = res.phone || '';
       this.email = res.email || '';
       this.apiLink = res.apiLink || '';
       this.name = res.name || '';
       this.copyright = res.copyright || '';
    }
  });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      
      this.apiService.submitContactForm(this.contactForm.value).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          Swal.fire({
            title: 'Message Sent!',
            text: 'Your request has been sent to the admin email successfully.',
            icon: 'success',
            confirmButtonColor: '#0a7e8d'
          });
          this.contactForm.reset();
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error("Error sending message:", err);
          Swal.fire({
            title: 'Error!',
            text: err.error?.message || 'Failed to send the message. Please check your internet or try again later.',
            icon: 'error',
            confirmButtonColor: '#e74c3c'
          });
        }
      });
    } else {
      Swal.fire({
        title: 'Validation Error!',
        text: 'Please fill all the required fields correctly.',
        icon: 'error',
        confirmButtonColor: '#e74c3c'
      });
      this.contactForm.markAllAsTouched();
    }
  }
}
