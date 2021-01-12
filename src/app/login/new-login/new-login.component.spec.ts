import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewLoginComponent } from './new-login.component';

describe('NewLoginComponent', () => {
  let component: NewLoginComponent;
  let fixture: ComponentFixture<NewLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewLoginComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
