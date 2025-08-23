import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterSplash } from './router-splash';

xdescribe('RouterSplash', () => {
  let component: RouterSplash;
  let fixture: ComponentFixture<RouterSplash>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterSplash]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouterSplash);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
