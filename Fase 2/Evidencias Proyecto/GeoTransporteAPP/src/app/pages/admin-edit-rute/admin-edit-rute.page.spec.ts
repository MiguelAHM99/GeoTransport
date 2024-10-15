import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminEditRutePage } from './admin-edit-rute.page';

describe('AdminEditRutePage', () => {
  let component: AdminEditRutePage;
  let fixture: ComponentFixture<AdminEditRutePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminEditRutePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
