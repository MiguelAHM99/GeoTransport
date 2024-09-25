import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminVehiclePage } from './admin-vehicle.page';

describe('AdminVehiclePage', () => {
  let component: AdminVehiclePage;
  let fixture: ComponentFixture<AdminVehiclePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminVehiclePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
