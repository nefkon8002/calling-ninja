import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadaudioComponent } from './uploadaudio.component';

describe('UploadaudioComponent', () => {
  let component: UploadaudioComponent;
  let fixture: ComponentFixture<UploadaudioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadaudioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadaudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
