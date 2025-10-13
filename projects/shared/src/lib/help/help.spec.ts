import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Help } from './help';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('Help', () => {
  let component: Help;
  let fixture: ComponentFixture<Help>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Help, NoopAnimationsModule],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Help);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render page title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.page-title');
    expect(title?.textContent).toContain('Getting Started Guide');
  });

  it('should render video tutorial section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const videoSection = compiled.querySelector('.video-card');
    expect(videoSection).toBeTruthy();
  });

  it('should have Instagram download link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const downloadLink = compiled.querySelector('a[href="https://www.instagram.com/download/request"]');
    expect(downloadLink).toBeTruthy();
  });

  it('should render navigation buttons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('.page-footer button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('should render app password security section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const securityCard = compiled.querySelector('.security-card');
    expect(securityCard).toBeTruthy();
  });

  it('should render rate limiting information', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const content = compiled.textContent;
    expect(content).toContain('Understanding Rate Limits');
  });

  it('should render checklist section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const checklist = compiled.querySelector('.checklist');
    expect(checklist).toBeTruthy();
  });
});

