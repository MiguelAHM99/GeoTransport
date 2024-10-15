import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDriverPage } from './admin-driver.page';

describe('AdminDriverPage', () => {
  let component: AdminDriverPage;
  let fixture: ComponentFixture<AdminDriverPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDriverPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
