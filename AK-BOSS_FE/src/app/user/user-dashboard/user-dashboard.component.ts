import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Game, UserGame } from '../../core/module/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GamedataService } from '../../core/services/gamedata.service';
import { LoaderComponent } from '../../shared/loader/loader.component';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [FooterComponent, HeaderComponent,CommonModule,FormsModule , LoaderComponent],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent implements OnInit,OnDestroy{
    router = inject(Router);
  gameService = inject(ApiService);
  gameDataService = inject(GamedataService);

  games: UserGame[] = [];
  isLoading: boolean = false;
  private subscription!: Subscription;

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames() {
    this.isLoading = true; // 🔹 Loader start

    this.subscription = this.gameService.getUserGames().subscribe({
      next: (res) => {
        if (res.success) {
          this.games = res.data;
        } else {
          console.warn('API responded with success=false');
        }
        this.isLoading = false; // 🔹 Loader stop
      },
      error: (err) => {
        console.error('API error:', err);
        this.isLoading = false; // 🔹 Loader stop even if failed
      }
    });
  }

  ngOnDestroy(): void {
    // 🔹 Component destroy hone par subscription cleanup
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  playGame(game: any) {
    this.gameDataService.setGameData(game);
    this.router.navigate(['/user/all-games']);
  }

  openChart() {
    this.router.navigate(['/user/share-page']);
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

}
