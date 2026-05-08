import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GamedataService } from '../../core/services/gamedata.service';
import { ApiService } from '../../core/services/api.service';
import { WalletService } from '../../core/services/wallet.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { LoaderComponent } from '../../shared/loader/loader.component';

@Component({
  selector: 'app-play-game',
  standalone: true,
  imports: [
    FooterComponent,
    HeaderComponent,
    CommonModule,
    LoaderComponent,
    FormsModule,
  ],
  templateUrl: './play-game.component.html',
  styleUrl: './play-game.component.scss',
})
export class PlayGameComponent implements OnInit {
  @Input() game: any;
  @Output() backClicked = new EventEmitter<void>();
  isLoading: boolean = false;
  date: Date = new Date();
  digit: number | null = null;
  amount: number | null = null;
  numbers: { digit: number; amount: number }[] = [];
  totalAmount = 0;
  gameDataService = inject(GamedataService);
  apiservice = inject(ApiService);
  walletService = inject(WalletService);
  location = inject(Location);
  toastr = inject(ToastrService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  selectedGameTimeType: any;
  isOpenDisabled = false;
  entryType: string = '';
  isCloseDisabled = false;

  ngOnInit() {
   this.entryType = this.route.snapshot.paramMap.get('entryType') || '';
  this.gameDataService.getGameData().subscribe((game) => {
    if (game) {
      this.game = game;
      this.evaluateGameTime();
    }
  });
  }

  evaluateGameTime() {
    const now = moment(); // Current IST time
    const openTime = moment(this.game.open_time, 'h:mm A');
    const closeTime = moment(this.game.close_time, 'h:mm A');

    // Disable radio buttons if time passed
    if (now.isAfter(openTime)) this.isOpenDisabled = true;
    if (now.isAfter(closeTime)) this.isCloseDisabled = true;
  }

  onRadioClick(type: string) {
    if (type === 'open' && this.isOpenDisabled) {
      this.toastr.warning('Open time is over!');
      return;
    }
    if (type === 'close' && this.isCloseDisabled) {
      this.toastr.warning('Close time is over!');
      return;
    }
    this.selectedGameTimeType = type;
  }

  isDigitValidjodi(): boolean {
    if (!this.digit) return false;
    const val = this.digit.toString();
    return val.length === 2 && !isNaN(Number(val));
  }

  isDigitValidsingleank(): boolean {
    if (!this.digit) return false;
    const val = this.digit.toString();
    return val.length === 1 && !isNaN(Number(val));
  }

  isDigitValidsinglepanna(): boolean {
    if (!this.digit) return false;
    const val = this.digit.toString();
    return val.length === 3 && !isNaN(Number(val));
  }

  addNumber() {
    let minamount = 10;
    let maxamount = 10000;

    if (this.digit === null) {
      this.toastr.error('Digit is required');
      return;
    }
    if (this.amount === null) {
      this.toastr.error('Amount is required');
      return;
    }
    if (this.amount < minamount) {
      this.toastr.error(`Amount cannot be less than ${minamount}`);
      return;
    }
    if (this.amount > maxamount) {
      this.toastr.error(`Amount cannot be more than ${maxamount}`);
      return;
    }

    this.numbers.push({ digit: this.digit, amount: this.amount });
    this.calculateTotal();
    this.digit = null;
    this.amount = null;
  }

  calculateTotal() {
    this.totalAmount = this.numbers.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );
  }

  removeNumber(index: number) {
    this.numbers.splice(index, 1);
    this.calculateTotal();
  }

  submit() {
     if (this.isLoading) return;
        if (!this.selectedGameTimeType && this.game.entrytype ==="singleank") {
      this.toastr.error('Please select game type Open/Close');
      return;
    }

       if (!this.selectedGameTimeType && this.game.entrytype ==="singlepanna") {
      this.toastr.error('Please select game type Open/Close');
      return;
    }

    if (!this.numbers.length) {
      this.toastr.error('Please add at least one entry before submitting.');
      return;
    }

    const todayDate = new Date().toISOString().split('T')[0];

    const payload = {
      game_id: this.game.id,
      input_date: todayDate,
      name: this.game.name,
      total_amount: this.totalAmount,
      entrytype: this.game.entrytype,
      game_time_type: this.selectedGameTimeType,
      entries: this.numbers.map((item) => ({
        digit: Number(item.digit),
        amount: item.amount,
      })),
    };

    this.isLoading = true; // ✅ Start loader

    const handleResponse = (response: any) => {
      this.isLoading = false; // ✅ Stop loader
      this.handleSuccess(response);
    };

    const handleError = (err: any) => {
      this.isLoading = false; // ✅ Stop loader
      this.handleError(err);
    };

    switch (this.game.entrytype) {
      case 'singleank':
        this.apiservice.saveEntries(payload, 'single').subscribe({
          next: handleResponse,
          error: handleError,
        });
        break;

      case 'jodi':
        this.apiservice.saveEntries(payload, 'jodi').subscribe({
          next: handleResponse,
          error: handleError,
        });
        break;

      case 'singlepanna':
        this.apiservice.saveEntries(payload, 'singlepanna').subscribe({
          next: handleResponse,
          error: handleError,
        });
        break;

      default:
        this.isLoading = false;
        console.warn('Unsupported entry type:', this.game.entrytype);
        break;
    }
  }

  handleSuccess(response: any) {
    this.toastr.success(response.message);
    this.walletService.refreshWallet();
    this.router.navigate(['/user/report']);
  }

  handleError(err: any) {
    this.toastr.error(err.data.message || 'Error occurred');
  }
  back() {
    this.location.back();
  }
}
