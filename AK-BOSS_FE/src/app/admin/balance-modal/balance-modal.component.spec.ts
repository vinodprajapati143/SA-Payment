import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceModalComponent } from './balance-modal.component';

describe('BalanceModalComponent', () => {
  let component: BalanceModalComponent;
  let fixture: ComponentFixture<BalanceModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanceModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BalanceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
