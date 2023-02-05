import { TestBed } from '@angular/core/testing';

import { PoolService } from './pool.service';

describe('PoolService', () => {
  let service: PoolService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PoolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
