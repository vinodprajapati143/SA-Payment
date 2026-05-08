import { HttpClient } from '@angular/common/http';
import { Component,  } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../core/services/api.service';
import { NgFor, NgIf } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [NgFor, NgIf,FormsModule,ReactiveFormsModule,RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
password: boolean = false;
  forgotForm: FormGroup;
  resetForm: FormGroup;

    constructor(private fb: FormBuilder, private http: HttpClient, private backendservice:ApiService, private toastr:ToastrService, private router:Router) {
    this.forgotForm = this.fb.group({
      countryCode: ['+91', Validators.required],
      phone: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.resetForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  ngOnInit(): void {
    
  }

  showOtpSection = false;
  otpArray = new Array(6).fill('');

 

    sendOtp() {
    if (this.forgotForm.invalid) return;


    this.backendservice.sendotp(this.forgotForm.value).subscribe({
        next: (res: any) => {
          if (res.success) {
             this.toastr.success(res.message)
             this.showOtpSection = true; // move to OTP input section
                  setTimeout(() => {
                const firstInput = document.getElementById('otp0') as HTMLInputElement;
                firstInput?.focus();
              }, 100);
          } else {
             this.toastr.error(res.message)

          }
        },
        error: (err) => {
          this.toastr.error(err.data.message)
        }
      });

 
  }


  handleOtpInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '');

    input.value = value;

    if (value && index < this.otpArray.length - 1) {
      const nextInput = document.getElementById(
        'otp' + (index + 1)
      ) as HTMLInputElement;
      nextInput?.focus();
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

  goBack(){
    this.showOtpSection = false; // back to login or initial screen
    this.forgotForm.reset();
    this.resetForm.reset();
    this.router.navigate(['/auth/login']); 
  }

  goToHome() {
    this.router.navigate(['/user/home']);
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

  handleBackspace(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prevInput = document.getElementById(
        'otp' + (index - 1)
      ) as HTMLInputElement;
      prevInput?.focus();
    }
  }

submit() {
  // 1. OTP Inputs se OTP collect karo
  const otpInputs = Array.from(
    { length: 6 },
    (_, i) => (document.getElementById('otp' + i) as HTMLInputElement)?.value
  );
  const otp = otpInputs.join('');

  // 2. Validation
  if (otp.length !== 6) {
    this.toastr.error("Please enter a valid 6-digit OTP")

    return;
  }
 

  // 3. Payload ready karo
  const payload = {
    countryCode: this.forgotForm.value.countryCode,
    phone: this.forgotForm.value.phone,
    otp: otp,
    newPassword: this.resetForm.value.newPassword
  };

  this.backendservice.resetPass(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.toastr.success(res.message)
          this.router.navigate(['/auth/login']);
          this.showOtpSection = false; // back to login or initial screen
        } else {
          this.toastr.error(res.message)
          if(res.success == false && res.message === "OTP expired"){
            this.showOtpSection = false;
          }

        }
      },
      error: (err) => {
        this.toastr.error(err.data.message)

          if(err.data.success == false && err.data.message === "OTP expired"){
            this.showOtpSection = false;
          }
      }
    });
}

}
