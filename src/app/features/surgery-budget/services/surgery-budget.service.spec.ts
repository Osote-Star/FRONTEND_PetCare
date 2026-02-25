import { TestBed } from '@angular/core/testing';

import { SurgeryBudgetService } from './surgery-budget.service';

describe('SurgeryBudgetService', () => {
  let service: SurgeryBudgetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SurgeryBudgetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
