import { Component } from '@angular/core';
import { LoaderService } from '../../core/services/loader.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent {
 showLoader = false;

  constructor(private loaderService: LoaderService) { }

  ngOnInit() {
    // Subscribe to loader state changes
    this.loaderService.loaderState$.subscribe(state => {
      this.showLoader = state;
      console.log('this.showLoader: ', this.showLoader);
    });
  }
}
