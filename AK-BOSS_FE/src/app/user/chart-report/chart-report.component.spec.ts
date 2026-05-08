import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartReportComponent } from './chart-report.component';

describe('ChartReportComponent', () => {
  let component: ChartReportComponent;
  let fixture: ComponentFixture<ChartReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChartReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
