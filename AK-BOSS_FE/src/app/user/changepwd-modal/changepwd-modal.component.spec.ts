import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangepwdModalComponent } from './changepwd-modal.component';

describe('ChangepwdModalComponent', () => {
  let component: ChangepwdModalComponent;
  let fixture: ComponentFixture<ChangepwdModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangepwdModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChangepwdModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
