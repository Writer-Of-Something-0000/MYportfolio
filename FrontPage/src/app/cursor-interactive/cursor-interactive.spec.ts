import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CursorInteractive } from './cursor-interactive';

describe('CursorInteractive', () => {
  let component: CursorInteractive;
  let fixture: ComponentFixture<CursorInteractive>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CursorInteractive]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CursorInteractive);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
