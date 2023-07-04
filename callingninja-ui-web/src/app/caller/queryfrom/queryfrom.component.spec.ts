import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryfromComponent } from './queryfrom.component';

describe('QueryfromComponent', () => {
  let component: QueryfromComponent;
  let fixture: ComponentFixture<QueryfromComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueryfromComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryfromComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
