import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurgeryBudgetComponent } from './surgery-budget.component';

describe('SurgeryBudgetComponent', () => {
  let component: SurgeryBudgetComponent;
  let fixture: ComponentFixture<SurgeryBudgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurgeryBudgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurgeryBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
