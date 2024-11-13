import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { socioGuard } from './socio.guard';

describe('socioGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => socioGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
