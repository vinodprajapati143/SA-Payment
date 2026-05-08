import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastrService } from 'ngx-toastr';
import { WalletService } from '../../core/services/wallet.service';
import { LoaderComponent } from '../../shared/loader/loader.component';

@Component({
  selector: 'app-withdrawal',
  standalone: true,
  imports: [
    HeaderComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FooterComponent,
    LoaderComponent,
  ],
  templateUrl: './withdrawal.component.html',
  styleUrl: './withdrawal.component.scss',
})
export class WithdrawalComponent implements OnInit {
  withdraw: any = {
    amount: null,
    mode: '',
    phone: '',
    name: '',
    upiId: '',
    accountNumber: '',
    ifsc: '',
  };
  isLoading: boolean = false;
  savedDetails: any = null;
  inputsDisabled = false;
  userdata: any;
  walletblance: any;
  constructor(
    private withdrawalService: ApiService,
    private walletservice: WalletService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
  this.loadAllData();
  }

  getuseerandwalletbalnce() {
   return new Promise<void>((resolve) => {
    this.withdrawalService.userSubject.subscribe((val: any) => {
      this.userdata = val;
      resolve();
    });

    this.walletservice.walletBalance$.subscribe((val: any) => {
      this.walletblance = val;
      resolve();
    });
  });
  }

  loadAllData() {
  this.isLoading = true; // 👈 Start loader

  Promise.all([
    this.getpaymentdetails(),
    this.getuseerandwalletbalnce()
  ])
    .then(() => {
      this.isLoading = false; // 👈 Hide loader when both done
    })
    .catch(() => {
      this.isLoading = false; // 👈 Hide loader even if one fails
    });
}

  getpaymentdetails() {
 return new Promise<void>((resolve, reject) => {
    this.withdrawalService.getPaymentDetails().subscribe({
      next: (res: any) => {
        if (res.success && res.payment_details) {
          this.savedDetails = res.payment_details;
          if (this.savedDetails.upi_id) this.setMode('upi');
          else if (this.savedDetails.bank_account_number) this.setMode('bank');
          this.inputsDisabled = true;
        } else {
          this.savedDetails = null;
          this.inputsDisabled = false;
        }
        resolve(); // ✅ Done
      },
      error: (err) => {
        console.error('getPaymentDetails error:', err);
        reject(err);
      }
    });
  });
  }

  setMode(mode: string) {
    this.withdraw.mode = mode;
    if (mode === 'upi' && this.savedDetails && this.savedDetails.upi_id) {
      this.withdraw.phone = this.savedDetails.upi_phone_number;
      this.withdraw.name = this.savedDetails.upi_account_holder_name;
      this.withdraw.upiId = this.savedDetails.upi_id;
      this.withdraw.accountNumber = '';
      this.withdraw.ifsc = '';
    } else if (
      mode === 'bank' &&
      this.savedDetails &&
      this.savedDetails.bank_account_number
    ) {
      this.withdraw.phone = this.savedDetails.bank_phone_number;
      this.withdraw.name = this.savedDetails.bank_account_holder_name;
      this.withdraw.accountNumber = this.savedDetails.bank_account_number;
      this.withdraw.ifsc = this.savedDetails.bank_ifsc_code;
      this.withdraw.bank_name = this.savedDetails.bank_name;

      this.withdraw.upiId = '';
    } else {
      // Mode change, allow new fields entry
      this.withdraw.phone = '';
      this.withdraw.name = '';
      this.withdraw.upiId = '';
      this.withdraw.accountNumber = '';
      this.withdraw.ifsc = '';
      this.inputsDisabled = false;
    }
  }

  onModeChange(event: any) {
    this.setMode(event.target.value);
  }

  submitWithdrawal() {
    // Validation
    if (
      !this.withdraw.amount ||
      this.withdraw.amount < 100 ||
      !this.withdraw.mode
    ) {
      this.toastr.error('withdraw limit minimum ₹100 amount');
      return;
    }

    if (
      !this.withdraw.amount ||
      this.withdraw.amount > 20000 ||
      !this.withdraw.mode
    ) {
      this.toastr.error('withdraw limit maximum ₹20,000 amount');
      return;
    }

    // Only withdrawal if savedDetails ready (never trigger save again!)
    if (
      (this.withdraw.mode === 'upi' &&
        this.savedDetails &&
        this.savedDetails.upi_id) ||
      (this.withdraw.mode === 'bank' &&
        this.savedDetails &&
        this.savedDetails.bank_account_number)
    ) {
      this.postWithdrawal();
      return;
    }

    // First time: save details then withdraw
    let saveObj: any = {};
    if (this.withdraw.mode === 'upi') {
      if (!this.withdraw.phone || !this.withdraw.name || !this.withdraw.upiId) {
        this.toastr.error('All UPI details required');
        return;
      }
      saveObj = {
        upi_phone_number: this.withdraw.phone,
        upi_account_holder_name: this.withdraw.name,
        upi_id: this.withdraw.upiId,
      };
    } else if (this.withdraw.mode === 'bank') {
      if (
        !this.withdraw.phone ||
        !this.withdraw.name ||
        !this.withdraw.accountNumber ||
        !this.withdraw.ifsc ||
        !this.withdraw.bank_name
      ) {
        this.toastr.error('All bank details required');
        return;
      }
      saveObj = {
        bank_phone_number: this.withdraw.phone,
        bank_account_holder_name: this.withdraw.name,
        bank_account_number: this.withdraw.accountNumber,
        bank_ifsc_code: this.withdraw.ifsc,
        bank_name: this.withdraw.bank_name,
      };
    }

    this.withdrawalService.savePaymentDetails(saveObj).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.savedDetails = saveObj; // so form disables next time
          this.toastr.success(res.message);

          this.postWithdrawal();
        } else {
          this.toastr.error(res.message || 'Could not save details');
        }
      },
      error: (err: any) => {
        // API rejected or network error
        const msg =
          err?.error?.message ||
          'Failed to save details. This may be due to already submitted details—please contact support.';
        this.toastr.error(msg);
      },
    });
  }

  postWithdrawal() {
    this.withdrawalService
      .createWithdrawal({
        amount: this.withdraw.amount,
        payment_method: this.withdraw.mode,
      })
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.toastr.success(
              res.message || 'Withdrawal request placed successfully!'
            );
            this.withdraw.amount = null;
            this.walletservice.refreshWallet();
          } else {
            this.toastr.error(res.message || 'Withdrawal could not be placed');
          }
        },
        error: (err: any) => {
          // Proper error parsing
          const msg =
            err?.data?.message ||
            'Withdrawal failed, please try again or contact support.';
          this.toastr.error(msg);
        },
      });
  }

  openWhatsApp() {
    const phoneNumber = '919575259525';
    const message = 'Hello, I need assistance!';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, '_blank');
  }

  closeWhatsApp() {
    const url = `https://wa.me/919575259525?text=Goodbye`;
    window.open(url, '_blank');
  }

  navigateToAddAmount() {
    window.location.href = '/user/add-amount';
  }
}
