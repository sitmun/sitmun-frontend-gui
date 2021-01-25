import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTreeComponent } from './data-tree.component';

describe('DataTreeComponent', () => {
  let component: DataTreeComponent;
  let fixture: ComponentFixture<DataTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataTreeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
