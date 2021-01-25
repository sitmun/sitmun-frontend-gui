import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogGridComponent } from './dialog-grid.component';

describe('DialogGridComponent', () => {
  let component: DialogGridComponent;
  let fixture: ComponentFixture<DialogGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
