import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MazeGridComponent } from './maze-grid.component';

describe('MazeGridComponent', () => {
  let component: MazeGridComponent;
  let fixture: ComponentFixture<MazeGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MazeGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MazeGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
