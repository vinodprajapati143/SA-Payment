import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalWithdrawalComponent } from './bal-withdrawal.component';

describe('BalWithdrawalComponent', () => {
  let component: BalWithdrawalComponent;
  let fixture: ComponentFixture<BalWithdrawalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalWithdrawalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BalWithdrawalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
