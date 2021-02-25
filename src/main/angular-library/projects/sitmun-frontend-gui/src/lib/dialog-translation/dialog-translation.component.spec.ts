import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogTranslationComponent } from './dialog-translation.component';

describe('DialogTranslationComponent', () => {
  let component: DialogTranslationComponent;
  let fixture: ComponentFixture<DialogTranslationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogTranslationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogTranslationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
