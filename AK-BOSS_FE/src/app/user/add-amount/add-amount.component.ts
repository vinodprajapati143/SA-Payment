import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { WalletService } from '../../core/services/wallet.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { LoaderComponent } from "../../shared/loader/loader.component";

@Component({
  selector: 'app-add-amount',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, FormsModule, CommonModule, LoaderComponent],
  templateUrl: './add-amount.component.html',
  styleUrl: './add-amount.component.scss'
})
export class AddAmountComponent implements OnInit {
  amount: number = 0; // for bound input
  userdata: any;
  walletblance: any;
  paymentStatus: any;
  paymentData: any;
  errorMessage: any;
  isLoading: boolean = false;

  constructor(
    private walletService: WalletService,
    private apiservice:ApiService,
    private toastr: ToastrService,
    private route:ActivatedRoute
  ) {}

ngOnInit(): void {
  this.isLoading = true; // Start loader immediately

  // Wait for both wallet & user data to load
  this.getuseerandwalletbalnce();

  const clientTxnId = this.route.snapshot.queryParamMap.get('client_txn_id');

  if (clientTxnId) {
    this.walletService.checkOrderStatus(clientTxnId).subscribe({
      next: (result) => {
        if (result.success) {
          this.paymentStatus = result.status;
          this.paymentData = result.data;
        } else {
          this.errorMessage = result.message;
        }
        this.isLoading = false; // Stop loader after response
      },
      error: () => {
        this.errorMessage = 'Something went wrong. Please try again.';
        this.isLoading = false;
      },
    });
  } else {
    // Agar koi transaction nahi chal rahi
    // tab loader tabhi band hoga jab user aur wallet data dono mil jaaye
    setTimeout(() => {
      this.isLoading = false;
    }, 800); // thoda smoothness effect ke liye
  }
}

getuseerandwalletbalnce() {
  let userLoaded = false;
  let walletLoaded = false;

  this.apiservice.userSubject.subscribe((val: any) => {
    if (val) {
      this.userdata = val;
      userLoaded = true;
      this.checkAllLoaded(userLoaded, walletLoaded);
    }
  });

  this.walletService.walletBalance$.subscribe((val: any) => {
    if (val !== undefined && val !== null) {
      this.walletblance = val;
      walletLoaded = true;
      this.checkAllLoaded(userLoaded, walletLoaded);
    }
  });
}

checkAllLoaded(userLoaded: boolean, walletLoaded: boolean) {
  // dono data mil gaye tabhi loader hatao
  if (userLoaded && walletLoaded) {
    this.isLoading = false;
  }
}

  setQuickAmount(val: number) {
    this.amount = val;
  }

   submitAddAmount() {
    if (!this.amount || this.amount < 1) {
      this.toastr.error('Minimum amount is ₹1');
      return;
    }
    this.walletService.createAddMoneyOrder(this.amount).subscribe({
      next: (res) => {
        if (res.success && res.payment_url) {
          window.location.href = res.payment_url; // LIVE gateway redirect
        } else {
          this.toastr.error(res.message || "Could not start payment");
        }
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || "Network/server error");
      }
    });
  }

  openWhatsApp() {
    const phoneNumber = "919575259525";
    const message = "Hello, I need assistance!";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }

  closeWhatsApp() {
    const url = `https://wa.me/919575259525?text=Goodbye`;
    window.open(url, "_blank");
  }

  navigateToWithdrawal() {
    window.location.href = '/user/withdrawal';
  }
}
