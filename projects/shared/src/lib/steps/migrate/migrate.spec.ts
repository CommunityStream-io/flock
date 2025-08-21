import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Migrate } from './migrate';

describe('Migrate', () => {
  let component: Migrate;
  let fixture: ComponentFixture<Migrate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Migrate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Migrate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
