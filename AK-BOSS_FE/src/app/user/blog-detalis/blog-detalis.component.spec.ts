import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogDetalisComponent } from './blog-detalis.component';

describe('BlogDetalisComponent', () => {
  let component: BlogDetalisComponent;
  let fixture: ComponentFixture<BlogDetalisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogDetalisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BlogDetalisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
