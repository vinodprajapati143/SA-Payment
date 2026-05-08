import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FooterComponent } from "../../shared/footer/footer.component";
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-game-rate',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './game-rate.component.html',
  styleUrl: './game-rate.component.scss'
})
export class GameRateComponent {
  
games = [
{ title: 'Single Ank', icon: 'assets/images/dice.png', route: '/user/play', rate: '₹1 → ₹9', description: 'Bet on a single number' },
{ title: 'Jodi', icon: 'assets/images/dice.png', route: '/user/jodi', rate: '₹1 → ₹90', description: 'Bet on a pair of numbers' },
{ title: 'Single Panna', icon: 'assets/images/dice.png', route: '/user/single-panna', rate: '₹1 → ₹120', description: 'Bet on a single panna' },
{ title: 'Double Panna', icon: 'assets/images/dice.png', route: '/user/double-panna', rate: '₹1001 → ₹9999', description: 'Bet on a double panna' },
{ title: 'Triple Panna', icon: 'assets/images/dice.png', route: '/user/triple-panna', rate: '₹10001 → ₹99999', description: 'Bet on a triple panna' },
{ title: 'Half Sangam A', icon: 'assets/images/dice.png', route: '/user/half-sangam-a', rate: '₹10 → ₹1200', description: 'Bet on half sangam' },
{ title: 'Full Sangam', icon: 'assets/images/dice.png', route: '/user/full-sangam', rate: '₹10 → ₹6000', description: 'Bet on full sangam' },
];
}
