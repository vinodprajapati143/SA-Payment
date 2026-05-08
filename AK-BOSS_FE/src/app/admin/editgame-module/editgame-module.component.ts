import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-editgame-module',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './editgame-module.component.html',
  styleUrl: './editgame-module.component.scss'
})
export class EditgameModuleComponent {

   constructor(private dialogRef: MatDialogRef<EditgameModuleComponent>, @Inject(MAT_DIALOG_DATA) public game: any) {}
  
    closePopup() {
    this.dialogRef.close();
  }
}
