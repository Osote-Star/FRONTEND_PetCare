import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterVetComponent } from './register-vet.component';

describe('RegisterVetComponent', () => {
  let component: RegisterVetComponent;
  let fixture: ComponentFixture<RegisterVetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterVetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterVetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
