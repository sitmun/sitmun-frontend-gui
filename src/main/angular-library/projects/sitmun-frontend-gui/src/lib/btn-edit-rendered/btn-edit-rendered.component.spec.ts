import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnEditRenderedComponent } from './btn-edit-rendered.component';

describe('BtnEditRenderedComponent', () => {
  let component: BtnEditRenderedComponent;
  let fixture: ComponentFixture<BtnEditRenderedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BtnEditRenderedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnEditRenderedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
