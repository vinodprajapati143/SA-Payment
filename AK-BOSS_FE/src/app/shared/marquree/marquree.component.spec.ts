import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarqureeComponent } from './marquree.component';

describe('MarqureeComponent', () => {
  let component: MarqureeComponent;
  let fixture: ComponentFixture<MarqureeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarqureeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MarqureeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
