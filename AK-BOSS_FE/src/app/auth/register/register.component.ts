import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ApiService } from '../../core/services/api.service';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule,RouterModule,ToastrModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

    registerForm: FormGroup;
  password: boolean = false;
  inviteCode: any;
  inviteCodeFromUrl: string | null = null;

  constructor(
    private storageService: StorageService,
    private route: ActivatedRoute,
    private toaster: ToastrService,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object,
    private backendservice: ApiService,
    private router: Router
  ) {

 
    this.registerForm = this.fb.group({
      username: [''],
      email: [''],
      smsvcode: [''],
      registerType: ['user'],
      pwd: [''], // password field
      invitecode: [''],
      domainurl: [this.getDomainUrl()],
      phonetype: [this.getPhoneType()],
      captchaId: ['static-captcha'],
      track: ['ak247'],
      deviceId: [this.getDeviceId()],
      language: ['en'],
      random: [Math.random().toString(36).slice(2)],
      signature: ['dummy-signature'],
      timestamp: [Date.now()], // optional: can auto-set this
      phone: [''],
      countryCode: ['+91'],
      agree: [false],
    });

  this.route.queryParams.subscribe(params => {
    if (params['ref']) {
      this.inviteCodeFromUrl = params['ref'];
      this.registerForm.patchValue({ invitecode: this.inviteCodeFromUrl });
      // Referral code URL se aaya hai, disable input
      this.registerForm.get('invitecode')?.disable();
    }
  });
  }

  getDomainUrl(): string {
    if (isPlatformBrowser(this.platformId)) {
      return window.location.origin;
    }
    return ''; // Server-side ya fallback value
  }

  toggleVisibility(): void {
    this.password = !this.password;
    const input = document.getElementById('password-input') as HTMLInputElement;
    const icon = document.getElementById('eye-icon') as HTMLElement;
    if (this.password) {
      input.type = 'text';
      icon.classList.add('fa-eye');
      icon.classList.remove('fa-eye-slash');
    } else {
      input.type = 'password';
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    }
  }

   allowOnlyNumbers(event: KeyboardEvent) {
  const charCode = event.which ? event.which : event.keyCode;
  // Allow only 0–9 (ASCII codes 48 to 57)
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
  }

  blockPaste(event: ClipboardEvent) {
    const pastedText = event.clipboardData?.getData('text') || '';
    if (!/^\d+$/.test(pastedText)) {
      event.preventDefault(); // Prevent pasting non-digit text
    }
  }

  getDeviceId() {
    const existingId = this.storageService.getItem('deviceId');
    if (existingId) return existingId;

    const newId = 'device-' + Math.random().toString(36).substring(2);
    this.storageService.setItem('deviceId', newId);
    return newId;
  }

  getPhoneType(): string {
    if (isPlatformBrowser(this.platformId)) {
      const userAgent = navigator.userAgent.toLowerCase();
      if (/android/.test(userAgent)) return 'android';
      if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
      return 'web';
    }
    return 'server'; // SSR ke case me
  }

    goBack(){
    this.router.navigate(['/user/home']); 
  }
  onSubmit() {
    const formData = this.registerForm.getRawValue();
    this.backendservice.register(formData).subscribe({
      next: (res) => {
        if(res){
          const response = res as { message: string }; // Type assertion
          if (response) {
            this.toaster.success(response.message);
            this.registerForm.reset();
            this.router.navigate(['/auth/login']);
          }

        }
      },
      error: (err) => {
        const error = err.data.message; // Type assertion
        this.toaster.error(error);
      },
    });
  }

  goToHome() {
    this.router.navigate(['/user/home']);
  }
  }
