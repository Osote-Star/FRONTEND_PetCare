import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosperroComponent } from './datosperro.component';

describe('DatosperroComponent', () => {
  let component: DatosperroComponent;
  let fixture: ComponentFixture<DatosperroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatosperroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatosperroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
