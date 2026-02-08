import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Selectedworks } from './selectedworks';

describe('Selectedworks', () => {
  let component: Selectedworks;
  let fixture: ComponentFixture<Selectedworks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Selectedworks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Selectedworks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
