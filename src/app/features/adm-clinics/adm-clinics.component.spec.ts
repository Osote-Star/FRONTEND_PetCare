import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmClinicsComponent } from './adm-clinics.component';

describe('AdmClinicsComponent', () => {
  let component: AdmClinicsComponent;
  let fixture: ComponentFixture<AdmClinicsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmClinicsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmClinicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
