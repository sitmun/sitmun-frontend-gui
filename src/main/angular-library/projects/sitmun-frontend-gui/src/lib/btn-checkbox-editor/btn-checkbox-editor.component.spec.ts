import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnCheckboxEditorComponent } from './btn-checkbox-editor.component';

describe('BtnCheckboxRenderedComponent', () => {
  let component: BtnCheckboxEditorComponent;
  let fixture: ComponentFixture<BtnCheckboxEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BtnCheckboxEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnCheckboxEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
