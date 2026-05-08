import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FooterComponent } from "../../shared/footer/footer.component";
import { NgFor, Location, CommonModule } from '@angular/common';
import { AdminRoutingModule } from "../../admin/admin-routing.module";
import { HeaderComponent } from '../header/header.component';
import { Router } from '@angular/router';
import { GamedataService } from '../../core/services/gamedata.service';
import { PlayGameComponent } from '../play-game/play-game.component';
import { take } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { Subscription } from 'rxjs/internal/Subscription';
import Swal from 'sweetalert2';
import { LoaderComponent } from '../../shared/loader/loader.component';


@Component({
  selector: 'app-all-games',
  standalone: true,
  imports: [FooterComponent, HeaderComponent, NgFor, AdminRoutingModule, LoaderComponent, NgFor, CommonModule],
  templateUrl: './all-games.component.html',
  styleUrl: './all-games.component.scss'
})
export class AllGamesComponent implements OnInit, OnDestroy {

  // 🧩 Dependencies
  router = inject(Router);
  location = inject(Location);
  gameService = inject(ApiService);
  gameDataService = inject(GamedataService);

  // 🎮 Data
  isLoading: boolean = false;
  gameName: string = '';
  selectedGame: any = null;

  private subscription!: Subscription;

  // 📋 Menu Items
  menuItems = [
    { title: 'Single Ank', icon: 'assets/images/dice.png', active: false, entryType: 'singleank' },
    { title: 'Jodi', icon: 'assets/images/dice.png', active: false, entryType: 'jodi' },
    { title: 'Single Panna', icon: 'assets/images/dice.png', active: false, entryType: 'singlepanna' },
    { title: 'Double Panna', icon: 'assets/images/dice.png', active: false, entryType: 'doublepanna' },
    { title: 'Triple Panna', icon: 'assets/images/dice.png', active: false, entryType: 'triplepanna' },
    { title: 'Half Sangam', icon: 'assets/images/dice.png', active: false, entryType: 'halfsangama' },
    { title: 'Full Sangam', icon: 'assets/images/dice.png', active: false, entryType: 'fullsangam' },
  ];

  // 🧭 Lifecycle
  ngOnInit(): void {
    this.subscription = this.gameDataService.getGameData().pipe(take(1)).subscribe((gameData) => {
      this.gameName = gameData.name;
    });
  }

  ngOnDestroy(): void {
    // 🧹 Cleanup
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // 🎯 Game Click Logic
  onGameClick(item: any) {
    this.isLoading = true;

    this.subscription = this.gameDataService.getGameData().pipe(take(1)).subscribe({
      next: (gameData) => {
        console.log('item: ', item);
        console.log('gameData: ', gameData);

        let canProceed = true;

        // 🚫 Restrict only Jodi entry after open time
        if (item.entryType === 'jodi') {
          const currentTime = new Date();
          const [hours, minutesPart] = gameData.open_time.split(':');
          const [minutes, meridian] = minutesPart.split(' ');

          let openHour = parseInt(hours, 10);
          const openMinute = parseInt(minutes, 10);

          if (meridian === 'PM' && openHour !== 12) openHour += 12;
          if (meridian === 'AM' && openHour === 12) openHour = 0;

          const openTime = new Date();
          openTime.setHours(openHour, openMinute, 0, 0);

         if (currentTime > openTime) {
            Swal.fire({
              icon: 'warning',
              title: 'Entry Closed',
              html: `You cannot make an entry.<br><b>${gameData.name}</b> open time is already over.<br><br><strong>${gameData.open_time}</strong>`,
              confirmButtonText: 'OK',
              confirmButtonColor: '#0A7E8D',
            });
            canProceed = false;
          }
        }

        // ✅ Proceed if allowed
        if (canProceed) {
          this.gameDataService.updateEntryType(item.entryType);
          this.router.navigate(['/user/play']);
          this.menuItems.forEach(i => (i.active = false));
          item.active = true;
          this.selectedGame = item;
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.isLoading = false;
      }
    });
  }

  back() {
    this.location.back();
  }
}
