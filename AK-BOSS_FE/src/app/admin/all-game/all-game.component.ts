import { Component, Inject, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSidebarComponent } from "../../shared/admin/admin-sidebar/admin-sidebar.component";
import { ApiService } from '../../core/services/api.service';
import { Game } from '../../core/module/models';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { interval, Subscription } from 'rxjs';
import { EditgameModuleComponent } from '../editgame-module/editgame-module.component';
import { MatDialog } from '@angular/material/dialog';
import { FooterComponent } from '../../shared/footer/footer.component';
import Swal from 'sweetalert2';

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
  selector: 'app-all-game',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent, FormsModule],
  templateUrl: './all-game.component.html',
  styleUrl: './all-game.component.scss'
})
export class AllGameComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private toastr = inject(ToastrService);
  private dialog = inject(MatDialog);
  private interval: any;
  private subscription!: Subscription;

  comingSoonGames: any[] = [];
  allGames: any[] = [];

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
    "img": "help",
    "text": "Help",
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

  subLinks = [{
    "img": "gamepad",
    "text": "All Game",
    "active": true
  },
  {
    "img": "gamepad",
    "text": "Add Games",
    "active": false
  },
  {
    "img": "gamepad",
    "text": "Add Games",
    "active": false
  },
  {
    "img": "gamepad",
    "text": "Add Games",
    "active": false
  },
  {
    "img": "gamepad",
    "text": "Add Games",
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
      icon: '/assets/images/dashboard/icons/triangle.svg'
    },
    {
      title: 'Active users',
      value: 20,
      percentage: '2.67%',
      direction: 'up',
      color: '#FFA726',
      bgColor: '#FF9F4330',
      compareText: 'Than last week',
      icon: '/assets/images/dashboard/icons/triangle.svg'
    },
    {
      title: 'On way order',
      value: 57,
      percentage: '0.67%',
      direction: 'down',
      color: '#64B5F6',
      bgColor: '#8ECAE630',
      compareText: 'Than last week',
      icon: '/assets/images/dashboard/icons/triangle-down.svg'
    },
    {
      title: 'Disabled user',
      value: 98,
      percentage: '2.67%',
      direction: 'down',
      color: '#EF5350',
      bgColor: '#F1656530',
      compareText: 'Than last week',
      icon: '/assets/images/dashboard/icons/triangle-down.svg'
    }
  ];
  timerSubscription: Subscription | undefined;

  games = [];
  formattedInputDate: any;
  ngOnInit() {
    this.loadGames();

  }

  ngOnDestroy(): void {
    // 👇 component destroy hote hi API calls band
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }






  isOpenInputEnabled(game: any): boolean {
    // Open countdown > 0 and input not filled
    return game.openCountdown > 0 && (!game.patte1 || !game.patte1_open);
  }
  isCloseInputEnabled(game: any): boolean {
    return game.closeCountdown > 0 && (!game.patte2 || !game.patte2_close);
  }




  setInputEnabledFlags() {
    const OPEN_WINDOW_ADVANCE = 30 * 60 * 1000; // 30 min
    const CLOSE_WINDOW_ADVANCE = 30 * 60 * 1000;

    this.comingSoonGames.forEach(game => {
      const openFilled = !!(game.patte1 || game.patte1_open);
      const closeFilled = !!(game.patte2 || game.patte2_close);

      game.openInputEnabled = false;
      game.closeInputEnabled = false;

      const now = new Date();
      const offset = 5.5 * 60 * 60 * 1000;
      const nowIST = new Date(now.getTime() + offset);
      const year = nowIST.getFullYear();
      const month = (nowIST.getMonth() + 1).toString().padStart(2, '0');
      const day = nowIST.getDate().toString().padStart(2, '0');
      const todayIST = `${year}-${month}-${day}`;

      const formatDateToYMD = (date: any) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // yesterday
      const yesterdayDate = (() => {
        const d = new Date(todayIST);
        d.setDate(d.getDate() - 1);
        return formatDateToYMD(d);
      })();

      this.formattedInputDate = game.formattedInputDate; // backend se mila hai

      // ✅ Normal open/close countdown check
      if (!openFilled && game.openCountdown <= OPEN_WINDOW_ADVANCE) {
        game.openInputEnabled = true;
      }

      if (!closeFilled && game.closeCountdown <= CLOSE_WINDOW_ADVANCE) {
        game.closeInputEnabled = true;
      }

      // ✅ Special case: yesterday ka input hai, open filled hai, close missing hai
      if (
        this.formattedInputDate === yesterdayDate &&
        openFilled &&
        !closeFilled
      ) {
        game.closeInputEnabled = true;
      }

      // ✅ If both inputs filled → disable dono
      if (openFilled && closeFilled) {
        game.openInputEnabled = false;
        game.closeInputEnabled = false;
      }
    });
  }











  loadGames() {
    this.subscription = this.apiService.getNearestGames().subscribe((res: any) => {
      const apiGames = res.data.comingSoonGames;

      apiGames.forEach((game: any) => {
        const existing = this.comingSoonGames.find(g => g.id === game.id);
        if (existing) {
          game.patte1 = existing.patte1;
          game.patte1_open = existing.patte1_open;
          game.patte2_close = existing.patte2_close;
          game.patte2 = existing.patte2;
        }

        // Pehli baar load pe dono timers set karo
        game.openCountdown = this.getRemainingTime(game.open_time, game.is_next_day_close, 'open');
        game.closeCountdown = this.getRemainingTime(game.close_time, game.is_next_day_close, 'close');
      });

      this.comingSoonGames = apiGames;

      // ✅ allGames ke liye bhi same karo
      const allGamesApi = res.data.allGames;
      allGamesApi.forEach((game: any) => {
        game.openCountdown = this.getRemainingTime(game.open_time, game.is_next_day_close, 'open');
        game.closeCountdown = this.getRemainingTime(game.close_time, game.is_next_day_close, 'close');
      });
      this.allGames = allGamesApi;

      this.setInputEnabledFlags();

      // Start timer update
      this.startCountdown();
    });
  }

  getTodayName(): string {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  }

  isHoliday(game: any): boolean {
    if (!game.days || game.days.length === 0) return true; // empty means holiday
    return !game.days.includes(this.getTodayName());
  }

  startCountdown() {
    if (this.interval) {
      clearInterval(this.interval);
    }

    this.interval = setInterval(() => {
      this.comingSoonGames.forEach((game: any) => {
        game.openCountdown = this.getRemainingTime(game.open_time, game.is_next_day_close, 'open');
        game.closeCountdown = this.getRemainingTime(game.close_time, game.is_next_day_close, 'close');

      });
      this.allGames.forEach((game: any) => {
        game.openCountdown = this.getRemainingTime(game.open_time, game.is_next_day_close, 'open');
        game.closeCountdown = this.getRemainingTime(game.close_time, game.is_next_day_close, 'close');
      });
    }, 1000);
  }


  getRemainingTime(time: string, isNextDay: number, type: 'open' | 'close'): number {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    let targetDateTime = new Date(`${today}T${time}`);

    // Agar time nikal gaya hai aur isNextDay hai
    if (targetDateTime.getTime() < now.getTime() && isNextDay === 1) {
      targetDateTime.setDate(targetDateTime.getDate() + 1);
    }

    // Special case: agar open time already nikal gaya hai (aur game shuru ho chuka hai)
    if (type === 'open' && targetDateTime.getTime() < now.getTime()) {
      return 0; // Open ho chuka
    }

    return Math.max(targetDateTime.getTime() - now.getTime(), 0);
  }

  formatTime(ms: number): { h: string, m: string, s: string } {
    if (!ms || ms <= 0) {
      return { h: "00", m: "00", s: "00" };
    }

    let totalSeconds = Math.floor(ms / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    return {
      h: this.pad(hours),
      m: this.pad(minutes),
      s: this.pad(seconds)
    };
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  restrictToThreeDigits(value: any): string {
    // Only allow up to 3 digits, and only numbers
    value = value ? value.toString().replace(/\D/g, '') : '';
    return value.slice(0, 3);
  }

  restrictToOneDigit(value: any): string {
    // Only allow 1 digit, and only numbers
    value = value ? value.toString().replace(/\D/g, '') : '';
    return value.slice(0, 1);
  }


  submitGame(game: any) {
    console.log('game: ', game);
 let inputType: 'open' | 'close' | null = null;
   if (game.openInputEnabled) {
    inputType = 'open';
  } else if (game.closeInputEnabled) {
    inputType = 'close';
  } else {
    this.toastr.error('Submission ka koi valid input available nahi hai.');
    return;
  }
  // Validation based on inputType
  if (inputType === 'open') {
    if (!game.patte1 || !game.patte1_open) {
      this.toastr.error('Open inputs ke liye patte1 aur patte1_open dono bharna zaruri hai.');
      return;
    }
  }

  if (inputType === 'close') {
    if (!game.patte1 || !game.patte1_open) {
      this.toastr.error('Close inputs bharne se pehle open inputs bharna zaruri hai.');
      return;
    }
    if (!game.patte2 || !game.patte2_close) {
      this.toastr.error('Close inputs ke liye patte2 aur patte2_close dono bharna zaruri hai.');
      return;
    }
  }

    const todayDate = new Date().toISOString().split('T')[0];

    // Agar open abhi fill ho raha hai (close missing hai)
    // toh aaj ki date bhejo
    let finalInputDate: string;
    if (!game.patte1_open || !game.patte2_close) {
      finalInputDate = todayDate;
    } else {
      // Agar open already filled tha, toh wahi date use karo jo backend se aayi thi
      finalInputDate = game.formattedInputDate || todayDate;
    }
    const payload = {
      id: game.id,
      patte1: game.patte1,
      patte1_open: game.patte1_open,
      patte2_close: game.patte2_close,
      patte2: game.patte2,
      input_date: finalInputDate
    };

    this.apiService.saveGameInput(payload).subscribe({
        next: (res) => {
            Swal.fire({
                      icon: 'success',
                      title: 'Game Saved',
                      html: `'<strong>'Game input saved successfully!</strong>`,
                      confirmButtonText: 'OK',
                      confirmButtonColor: '#0A7E8D',
                    });
        this.loadGames();
            if (!window.hasReloaded) {
        window.hasReloaded = true;
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
      },
      error: (err) => {
        console.error(err);
        alert('Error saving game input');
      }
    });
  }

  editGame(game: any) {
    // Implement edit functionality here
    // alert(`Edit game with ID: ${game.id}`);
    this.dialog.open(EditgameModuleComponent, {
      width: '100vw',
      panelClass: 'bottom-dialog',
      position: { left: '0', top: '0' },
      height: '100vh',
      data: game 
    });
  }





  getImageUrl(img: string, active: boolean | undefined) {
    return `/assets/images/dashboard/icons/${img}${active ? '-white' : ''}.svg`
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    // Allow only 0–9 (ASCII codes 48 to 57)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  blockPaste(event: ClipboardEvent) {
    const pastedText = event.clipboardData?.getData('tel') || '';
    if (!/^\d+$/.test(pastedText)) {
      event.preventDefault(); // Prevent pasting non-digit text
    }
  }
}

declare global {
  interface Window {
    hasReloaded?: boolean; // Optional property to track if reload has occurred
  }
}
