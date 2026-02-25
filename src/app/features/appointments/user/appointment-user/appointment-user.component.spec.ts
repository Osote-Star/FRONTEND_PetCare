import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentUserComponent } from './appointment-user.component';

describe('AppointmentUserComponent', () => {
  let component: AppointmentUserComponent;
  let fixture: ComponentFixture<AppointmentUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
