import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
@Component({
  selector: 'app-floating-buttons',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './floating-buttons.component.html',
  styleUrl: './floating-buttons.component.scss'
})
export class FloatingButtonsComponent {
  refresh() {
    window.location.reload();
  }

}
