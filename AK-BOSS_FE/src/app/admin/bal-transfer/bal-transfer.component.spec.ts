import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalTransferComponent } from './bal-transfer.component';

describe('BalTransferComponent', () => {
  let component: BalTransferComponent;
  let fixture: ComponentFixture<BalTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalTransferComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BalTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
