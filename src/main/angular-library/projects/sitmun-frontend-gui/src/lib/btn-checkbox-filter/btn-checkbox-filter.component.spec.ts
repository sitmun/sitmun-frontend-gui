import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnCheckboxFilterComponent } from './btn-checkbox-filter.component';

describe('BtnCheckboxFilterRenderedComponent', () => {
  let component: BtnCheckboxFilterComponent;
  let fixture: ComponentFixture<BtnCheckboxFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BtnCheckboxFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnCheckboxFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
