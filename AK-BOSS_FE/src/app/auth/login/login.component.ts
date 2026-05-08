import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoginResponse } from '../../core/module/login-response.model';
import { ApiService } from '../../core/services/api.service';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  loading = false;
  password = false;
  isOtpMode = false;
  countdown = 60;
  
  constructor(
    private storageService: StorageService,
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private fb: FormBuilder,
    private router: Router,
    private backendService: ApiService
  ) {
    this.loginForm = this.fb.group({
      countryCode: ['+91', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      pwd: ['', [Validators.required, Validators.minLength(6)]],
      phonetype: [this.getPhoneType()],
      logintype: ['normal'],
      language: ['en'],
      random: [Math.random().toString(36).slice(2)],
      signature: ['dummySignature'],
      timestamp: [Date.now()],
    });
  }

  startOtpTimer() {
    this.countdown = 60;
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(interval);
      }
    }, 1500);
  }

  toggleOtpMode() {
  this.isOtpMode = !this.isOtpMode;
    if (this.isOtpMode) {
      this.startOtpTimer();
    }
  }

   allowOnlyNumbers(event: KeyboardEvent) {
  const charCode = event.which ? event.which : event.keyCode;
  // Allow only 0–9 (ASCII codes 48 to 57)
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
  }

    goToHome() {
    this.router.navigate(['/user/home']);
  }

  blockPaste(event: ClipboardEvent) {
    const pastedText = event.clipboardData?.getData('text') || '';
    if (!/^\d+$/.test(pastedText)) {
      event.preventDefault(); // Prevent pasting non-digit text
    }
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
  getPhoneType(): string {
    if (isPlatformBrowser(this.platformId)) {
      const userAgent = navigator.userAgent.toLowerCase();
      if (/android/.test(userAgent)) return 'android';
      if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
      return 'web';
    }
    return 'server'; // SSR ke case me
  }

  get f() {
    return this.loginForm.controls;
  }

  ngOnInit(): void {
    this.storageService.clear();
    this.storageService.clear();
    this.storageService.clearCookies();
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    this.loading = true;
    const loginData = this.loginForm.value;
    this.backendService.login(loginData).subscribe({
      next: (res: LoginResponse) => {
        this.loading = false;
        if (res.token) {
          this.storageService.setItem('authToken', res.token);
        }
        this.toastr.success('Login successful!');
        if(res.data.registerType === "admin"){
          // this.router.navigate(['/admin/users']);
             this.router.navigate(['/admin/users']).then(() => {
          window.location.reload();
        });
          
        }
        else{
          // this.router.navigate(['/user/dashboard']);
            this.router.navigate(['/user/dashboard']).then(() => {
          window.location.reload();
        });
        }
        // window.location.reload();
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err?.error?.message || 'Login failed!');
      },
    });
  }

  goBack(){
    this.router.navigate(['/user/home']); 
  }
}
