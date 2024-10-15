import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminEditDriverPage } from './admin-edit-driver.page';

describe('AdminEditDriverPage', () => {
  let component: AdminEditDriverPage;
  let fixture: ComponentFixture<AdminEditDriverPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminEditDriverPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
