import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceReturnComponent } from './balance-return.component';

describe('BalanceReturnComponent', () => {
  let component: BalanceReturnComponent;
  let fixture: ComponentFixture<BalanceReturnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanceReturnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BalanceReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
