import { Component, OnInit } from '@angular/core';
import { AdminSidebarComponent } from "../../shared/admin/admin-sidebar/admin-sidebar.component";
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../core/services/api.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { Time12HourPipe } from '../../core/pipes/time12-hour.pipe';

@Component({
  selector: 'app-add-game',
  standalone: true,
  imports: [AdminSidebarComponent, CommonModule, FormsModule,ReactiveFormsModule,ToastrModule,Time12HourPipe],
  templateUrl: './add-game.component.html',
  styleUrl: './add-game.component.scss'
})
export class AddGameComponent implements OnInit {
  addGamePopupOpen: boolean = false;
  days: string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  // priceList = [
  //   { gameType: "Single Digit", price: 24000 },
  //   { gameType: "Jodi Digit", price: 24000 },
  //   { gameType: "Single Panna", price: 24000 },
  //   { gameType: "Double Panna", price: 24000 },
  //   { gameType: "Triple Panna", price: 24000 },
  //   { gameType: "Half Sangam", price: 24000 },
  //   { gameType: "Full Sangam", price: 24000 },
  // ];
  priceList= {
    "singleDigit": 24000,
    "jodiDigit": 24000,
    "singlePanna": 24000
  } 
  selectedDays: string[] = [];
  selectAll: boolean = false;
  gameForm: FormGroup;
   games: any[] = [];
  loading = true;

    constructor(private fb: FormBuilder, private http: HttpClient ,private apiService:ApiService, private toastr:ToastrService) {
    this.gameForm = this.fb.group({
      game_name: [''],
      open_time: [''],
      close_time: [''],
      days: [[]],
      prices:[this.priceList]
      
         // yahan array store hoga
    });
  }

   ngOnInit(): void {
    this.loadGames();
  }


  toggleSelectAll(event: any) {
    this.selectAll = event.target.checked;
    if (this.selectAll) {
      this.selectedDays = [...this.days]; // sare days
    } else {
      this.selectedDays = [];
    }
  }

    toggleDay(day: string, event: any) {
    if (event.target.checked) {
      this.selectedDays.push(day);
    } else {
      this.selectedDays = this.selectedDays.filter(d => d !== day);
    }

    // agar sare selected ho gaye to selectAll bhi check kar do
    this.selectAll = this.selectedDays.length === this.days.length;
  }

  editingGameId: any;
    saveGame() {


    const payload = this.gameForm.value;
    payload.days = this.selectedDays

         if (this.editingGameId) {
    // Update existing game
    this.apiService.updateGame(this.editingGameId, payload).subscribe({
      next: (res: any) => {
        this.toastr.success(res.message);
        this.addGamePopupOpen = false;
        this.editingGameId = null; // Reset editing state
        this.loadGames();
      },
      error: (err: any) => {
        this.toastr.error(err.error.message || 'Error updating game');
      }
    });
  }
  else{
    this.apiService.addGame(payload).subscribe({
     next: (res:any) =>{
        this.toastr.success(res.message);
        this.addGamePopupOpen =false;
        this.loadGames();
  
     },
     error : (err:any) =>{
      this.toastr.error(err.data.message);
     }
    });

  }

  }

    loadGames() {
    this.apiService.getGames().subscribe({
      next: (res:any) => {
        this.games = res.data; 
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching games', err);
        this.loading = false;
      }
    });
  }


  togglePopup(gameId?:any) {
      if (gameId) {
    // Fetch game data from backend by ID
    this.loadGameData(gameId);
  }
    this.addGamePopupOpen = !this.addGamePopupOpen;
  }

  loadGameData(gameId: any) {
  this.apiService.getGameById(gameId).subscribe({
    next: (gameData) => {
      this.gameForm.patchValue({
        
        game_name: gameData.game.game_name,
        open_time: gameData.game.open_time,
        close_time: gameData.game.close_time,
        // For days, you may need to set checkboxes accordingly in your component
        selectedDays: gameData.game.days // Make sure to handle this correctly
      });
      // Also update your selectedDays array if you use it
      this.selectedDays = [...gameData.game.days];
      this.editingGameId = gameData?.game?.id
    },
    error: (err) => {
      console.error('Error loading game data', err);
    }
  })
}

}
