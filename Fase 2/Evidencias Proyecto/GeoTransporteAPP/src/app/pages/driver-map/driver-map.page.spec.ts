import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DriverMapPage } from './driver-map.page';

describe('DriverMapPage', () => {
  let component: DriverMapPage;
  let fixture: ComponentFixture<DriverMapPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverMapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
