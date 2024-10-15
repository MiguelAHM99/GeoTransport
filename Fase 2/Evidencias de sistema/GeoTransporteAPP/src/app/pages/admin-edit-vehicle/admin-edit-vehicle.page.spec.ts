import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminEditVehiclePage } from './admin-edit-vehicle.page';

describe('AdminEditVehiclePage', () => {
  let component: AdminEditVehiclePage;
  let fixture: ComponentFixture<AdminEditVehiclePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminEditVehiclePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
