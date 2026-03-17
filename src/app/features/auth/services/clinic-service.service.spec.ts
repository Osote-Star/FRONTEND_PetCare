import { TestBed } from '@angular/core/testing';

import { ClinicServiceService } from './clinic-service';

describe('ClinicServiceService', () => {
  let service: ClinicServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClinicServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
