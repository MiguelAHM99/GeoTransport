import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminRutePage } from './admin-rute.page';

describe('AdminRutePage', () => {
  let component: AdminRutePage;
  let fixture: ComponentFixture<AdminRutePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminRutePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
