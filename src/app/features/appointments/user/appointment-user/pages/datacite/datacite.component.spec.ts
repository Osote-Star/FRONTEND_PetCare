import { ComponentFixture, TestBed } from '@angular/core/testing';

import { dataciteComponent } from './datacite.component';
describe('DataciteComponent', () => {
  let component: dataciteComponent;
  let fixture: ComponentFixture<dataciteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [dataciteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(dataciteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
