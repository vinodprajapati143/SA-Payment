import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PenalReportComponent } from './penal-report.component';

describe('PenalReportComponent', () => {
  let component: PenalReportComponent;
  let fixture: ComponentFixture<PenalReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PenalReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PenalReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
