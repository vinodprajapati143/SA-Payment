import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameRateComponent } from './game-rate.component';

describe('GameRateComponent', () => {
  let component: GameRateComponent;
  let fixture: ComponentFixture<GameRateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameRateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
