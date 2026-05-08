import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NgFor, CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';
import { MarqureeComponent } from '../../shared/marquree/marquree.component';
import { FloatingButtonsComponent } from '../../shared/floating-buttons/floating-buttons.component';
import { GameDisplayComponent } from '../../shared/game-display/game-display.component';
import { ApiService } from '../../core/services/api.service';
import { interval, map, startWith, Subscription, timer } from 'rxjs';
import { LoaderComponent } from "../../shared/loader/loader.component";
import { SettingService } from '../../core/services/setting.service';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    LoaderComponent,
    NgFor,
    CommonModule,
    RouterModule,
    HeaderComponent,
    MarqureeComponent,
    FloatingButtonsComponent,
    GameDisplayComponent,
    LoaderComponent
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  games: any;
  gamesResult: any;
  interval: any;
  private subscription!: Subscription;
  isLoading: boolean = false;
  private settingStore = inject(SettingService);
  sitename: any;
  copyright: any;
  apiLink: any;
  constructor(private router: Router, private gameService: ApiService) {}

  chartData = [
    {
      day: 'सोम',
      num: 3,
      blocks: [
        { threeDigit: '689', twoDigit: '35' },
        { threeDigit: '366', twoDigit: '53' },
        { threeDigit: '223', twoDigit: '78' },
        { threeDigit: '666', twoDigit: '87' },
      ],
    },
    {
      day: 'मंगल',
      num: 2,
      blocks: [
        { threeDigit: '156', twoDigit: '27' },
        { threeDigit: '467', twoDigit: '72' },
        { threeDigit: '477', twoDigit: '89' },
        { threeDigit: '333', twoDigit: '98' },
      ],
    },
    {
      day: 'बुध',
      num: 3,
      blocks: [
        { threeDigit: '779', twoDigit: '37' },
        { threeDigit: '359', twoDigit: '73' },
        { threeDigit: '134', twoDigit: '89' },
        { threeDigit: '478', twoDigit: '98' },
      ],
    },
    {
      day: 'गुरु',
      num: 3,
      blocks: [
        { threeDigit: '779', twoDigit: '35' },
        { threeDigit: '168', twoDigit: '53' },
        { threeDigit: '133', twoDigit: '79' },
        { threeDigit: '388', twoDigit: '97' },
      ],
    },
    {
      day: 'शुक्र',
      num: 5,
      blocks: [
        { threeDigit: '122', twoDigit: '56' },
        { threeDigit: '277', twoDigit: '65' },
        { threeDigit: '269', twoDigit: '78' },
        { threeDigit: '189', twoDigit: '87' },
      ],
    },
    {
      day: 'शनि',
      num: 2,
      blocks: [
        { threeDigit: '138', twoDigit: '25' },
        { threeDigit: '122', twoDigit: '52' },
        { threeDigit: '467', twoDigit: '79' },
        { threeDigit: '234', twoDigit: '97' },
      ],
    },
  ];

  tableData = [
    {
      time1: '09:05 AM',
      result1: '338-4',
      time2: '03:05 PM',
      result2: '338-4',
    },
    {
      time1: '09:05 AM',
      result1: '338-4',
      time2: '03:05 PM',
      result2: '338-4',
    },
    {
      time1: '09:05 AM',
      result1: '338-4',
      time2: '03:05 PM',
      result2: '338-4',
    },
    {
      time1: '09:05 AM',
      result1: '338-4',
      time2: '03:05 PM',
      result2: '338-4',
    },
    {
      time1: '09:05 AM',
      result1: '338-4',
      time2: '03:05 PM',
      result2: '338-4',
    },
  ];

  cards = [
    {
      title: 'Milan Morning',
      type: 'milan',
      line1: '1-6-3-8',
      line2: '119-114-238-288-567',
      line3: '13-18-63-68-31-36-81-86',
    },
    {
      title: 'Kalyan Morning',
      type: 'kalyan',
      line1: '4-9-5-0',
      line2: '257-270-289-140-190',
      line3: '45-40-95-90-54-59-04-09',
    },
    // Repeat as needed
  ];

  countdowns: {
    [gameId: number]: { hours: string; minutes: string; seconds: string };
  } = {};
  subscriptions: { [gameId: number]: Subscription } = {};

  ngOnInit(): void {
    this.loadpubligames();
    this.settingStore.getSite().subscribe(res => {
      if (res) {
        console.log('res: ', res);
        this.sitename = res.name || 'AK-BOSS';
        this.copyright = res.copyright || '';
       this.apiLink = res.apiLink || '';

      } });
    //  this.loadpubligamesResult()
  }

  now$ = interval(60_000).pipe(
    startWith(0),
    map(() => new Date())
  );

  openChart() {
    this.router.navigate(['/admin/users']);
  }

  chartReport(game: any) {
    this.router.navigate(['/user/chart-report'], {
      queryParams: { gameId: game.id },
    });
  }

  todayReport(game: any) {
    this.router.navigate(['/user/today-report'], {
      queryParams: { gameId: game.id },
    });
  }
loadpubligames() {
    this.isLoading = true; // start loader
    this.subscription = this.gameService.getpublicGames().subscribe({
      next: (res) => {
        const apiGames = res.data.comingSoonGames;

        apiGames.forEach((game: any) => {
          game.openCountdown = this.getRemainingTime(
            game.open_time,
            game.is_next_day_close,
            'open'
          );
          game.closeCountdown = this.getRemainingTime(
            game.close_time,
            game.is_next_day_close,
            'close'
          );
        });

        this.games = apiGames;
        this.gamesResult = res.data.allGames;
        this.startCountdown();

        this.isLoading = false; // ✅ stop loader after success
      },
      error: (err) => {
        console.error('Failed to fetch games', err);
        this.isLoading = false; // stop loader on error
      },
    });
  }

  startCountdown() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = setInterval(() => {
      this.games?.forEach((game: any) => {
        game.openCountdown = this.getRemainingTime(
          game.open_time,
          game.is_next_day_close,
          'open'
        );
        game.closeCountdown = this.getRemainingTime(
          game.close_time,
          game.is_next_day_close,
          'close'
        );
      });
    }, 1000);
  }

  getRemainingTime(time: string, isNextDay: number, type: 'open' | 'close'): number {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    let targetDateTime = new Date(`${today}T${time}`);

    if (targetDateTime.getTime() < now.getTime() && isNextDay === 1) {
      targetDateTime.setDate(targetDateTime.getDate() + 1);
    }
    if (type === 'open' && targetDateTime.getTime() < now.getTime()) {
      return 0;
    }
    return Math.max(targetDateTime.getTime() - now.getTime(), 0);
  }

  formatTime(ms: number): { h: string; m: string; s: string } {
    if (!ms || ms <= 0) return { h: '00', m: '00', s: '00' };
    let totalSeconds = Math.floor(ms / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;
    return {
      h: this.pad(hours),
      m: this.pad(minutes),
      s: this.pad(seconds),
    };
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  getTodayName(): string {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  }

  isHoliday(game: any): boolean {
    if (!game.days || game.days.length === 0) return true; // empty means holiday
    return !game.days.includes(this.getTodayName());
  }

  loadpubligamesResult() {
    this.gameService.getpublicGamesResult().subscribe({
      next: (res) => {
        this.gamesResult = res.games;
      },
      error: (err) => {
        console.error('Failed to fetch games', err);
      },
    });
  }
}
