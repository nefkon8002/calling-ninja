import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadnumbersComponent } from './uploadnumbers.component';

describe('UploadnumbersComponent', () => {
  let component: UploadnumbersComponent;
  let fixture: ComponentFixture<UploadnumbersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadnumbersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadnumbersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
