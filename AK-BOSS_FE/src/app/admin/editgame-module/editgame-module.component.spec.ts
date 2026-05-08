import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditgameModuleComponent } from './editgame-module.component';

describe('EditgameModuleComponent', () => {
  let component: EditgameModuleComponent;
  let fixture: ComponentFixture<EditgameModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditgameModuleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditgameModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
