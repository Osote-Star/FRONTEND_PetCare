import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiciossComponent } from './servicioss.component';

describe('ServiciossComponent', () => {
  let component: ServiciossComponent;
  let fixture: ComponentFixture<ServiciossComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiciossComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiciossComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
