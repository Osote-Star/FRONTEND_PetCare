import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentAdminComponent } from './appointment-admin.component';

describe('AppointmentAdminComponent', () => {
  let component: AppointmentAdminComponent;
  let fixture: ComponentFixture<AppointmentAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
